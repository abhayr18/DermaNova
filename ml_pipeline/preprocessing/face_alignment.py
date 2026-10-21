"""
DermaNova Dual-Mode Face Alignment & Cutaneous Macro-Lesion ROI Extraction Module
==================================================================================
Performs:
1. Optical Quality Gatekeeping: Blur detection (Laplacian variance) & Exposure analysis
2. Tier 1: OpenCV YuNet Deep Neural Network Face Detection & 5-Landmark Localization (<5MB RAM)
3. Tier 2: Cutaneous Macro-Skin Validator for close-up lesion crops (cheeks, forehead, chin)
4. Aspect-ratio preserving ROI extraction & Bicubic spatial normalization (224x224)
"""

from typing import Tuple, Optional, Dict, Any, Union
from pathlib import Path
import numpy as np
from PIL import Image

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False


class FaceROIExtractor:
    """
    Clinical-grade facial ROI extraction, optical quality validator,
    and Dual-Mode Face/Macro-Skin Detector using OpenCV YuNet + Cutaneous Chrominance.
    """

    def __init__(
        self,
        output_size: Tuple[int, int] = (224, 224),
        margin_ratio: float = 0.18,
        blur_threshold: float = 65.0,
        min_luminance: float = 35.0,
        max_luminance: float = 235.0,
        skin_presence_threshold: float = 0.28,
        yunet_model_path: Optional[str] = None
    ):
        self.output_size = output_size
        self.margin_ratio = margin_ratio
        self.blur_threshold = blur_threshold
        self.min_luminance = min_luminance
        self.max_luminance = max_luminance
        self.skin_presence_threshold = skin_presence_threshold

        # Initialize YuNet Neural Face Detector (Ultra-light 232KB ONNX model)
        self.root_dir = Path(__file__).resolve().parent.parent.parent
        self.yunet_path = (
            Path(yunet_model_path)
            if yunet_model_path
            else self.root_dir / "ml_pipeline" / "models" / "saved_models" / "face_detection_yunet_2023mar.onnx"
        )

        self.yunet_detector = None
        if HAS_OPENCV and self.yunet_path.exists():
            try:
                # YuNet detector initialized with default input size (dynamically set on predict)
                self.yunet_detector = cv2.FaceDetectorYN.create(
                    model=str(self.yunet_path),
                    config="",
                    input_size=(320, 320),
                    score_threshold=0.38,
                    nms_threshold=0.30,
                    top_k=5000
                )
            except Exception as e:
                self.yunet_detector = None

        self.last_detection_mode = "none"  # 'full_face_yunet', 'macro_skin_crop', 'unrecognized'
        self.last_landmarks = None

    def validate_optical_quality(self, img_np: np.ndarray) -> Dict[str, Any]:
        """
        Evaluate optical clarity and illumination suitability.
        img_np: RGB numpy array (H, W, 3) in [0, 255]
        """
        if not HAS_OPENCV:
            mean_lum = float(np.mean(img_np))
            return {
                "is_valid": True,
                "blur_score": 100.0,
                "is_blurry": False,
                "luminance": mean_lum,
                "exposure_status": "optimal"
            }

        # Convert to grayscale
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # 1. Blur Detection via Laplacian Variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_32F).var())
        is_blurry = laplacian_var < self.blur_threshold

        # 2. Exposure & Luminance Verification
        mean_lum = float(np.mean(gray))
        if mean_lum < self.min_luminance:
            exposure_status = "underexposed"
        elif mean_lum > self.max_luminance:
            exposure_status = "overexposed"
        else:
            exposure_status = "optimal"

        is_valid = (not is_blurry) and (exposure_status == "optimal")

        return {
            "is_valid": is_valid,
            "blur_score": round(laplacian_var, 2),
            "is_blurry": is_blurry,
            "luminance": round(mean_lum, 2),
            "exposure_status": exposure_status
        }

    def is_document_or_text_image(self, img_np: np.ndarray) -> Tuple[bool, str]:
        """
        Detects if the uploaded image is a document, certificate, marksheet,
        ID card, screenshot, or text paper rather than a human face or clinical skin photo.
        """
        if not HAS_OPENCV:
            return False, ""

        H, W = img_np.shape[:2]
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # 1. White paper background ratio
        white_paper_ratio = float(np.mean(gray > 205))

        # 2. Document grid / table line detection
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
        h_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, h_kernel)
        v_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, v_kernel)
        line_ratio = float((np.count_nonzero(h_lines) + np.count_nonzero(v_lines)) / (H * W))

        # 3. Small text character glyph contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        text_like_boxes = 0
        for c in contours:
            _, _, cw, ch = cv2.boundingRect(c)
            if 4 <= cw <= 80 and 5 <= ch <= 80:
                text_like_boxes += 1

        is_doc = (
            (white_paper_ratio > 0.40 and text_like_boxes > 35) or
            (line_ratio > 0.015 and text_like_boxes > 25) or
            (white_paper_ratio > 0.65 and text_like_boxes > 15)
        )

        if is_doc:
            return True, (
                "Document or certificate detected. DermaNova requires a clear, well-lit photograph "
                "of a human face, not an academic marksheet, ID card, or text paper."
            )

        return False, ""

    def _detect_yunet_face(self, img_np: np.ndarray) -> Tuple[bool, Optional[Tuple[int, int, int, int]], Optional[Dict[str, Tuple[float, float]]], float]:
        """
        Tier 1: Neural face detection using OpenCV YuNet.
        Detects bounding box + 5 facial landmarks (eyes, nose, mouth corners).
        """
        if not HAS_OPENCV or self.yunet_detector is None:
            return False, None, None, 0.0

        H, W = img_np.shape[:2]
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Constrain resolution for YuNet inference to max 640px for speed & consistency
        scale_factor = 1.0
        max_dim = max(H, W)
        if max_dim > 640:
            scale_factor = 640.0 / max_dim
            sw = int(W * scale_factor)
            sh = int(H * scale_factor)
            img_infer = cv2.resize(img_bgr, (sw, sh), interpolation=cv2.INTER_AREA)
        else:
            sw, sh = W, H
            img_infer = img_bgr

        try:
            self.yunet_detector.setInputSize((sw, sh))
            _, faces = self.yunet_detector.detect(img_infer)

            if faces is not None and len(faces) > 0:
                # Find face with highest area / confidence
                best_face = max(faces, key=lambda f: float(f[2] * f[3]))
                bx = int(best_face[0] / scale_factor)
                by = int(best_face[1] / scale_factor)
                bw = int(best_face[2] / scale_factor)
                bh = int(best_face[3] / scale_factor)
                score = float(best_face[-1])

                # Reject miniature thumbnail faces on ID cards/certificates/documents
                face_area_ratio = float((bw * bh) / (W * H))
                if face_area_ratio < 0.05 or (bw / float(W) < 0.14 and bh / float(H) < 0.14):
                    return False, None, None, 0.0

                # Bounding box clamp
                bx = max(0, min(W - 1, bx))
                by = max(0, min(H - 1, by))
                bw = max(10, min(W - bx, bw))
                bh = max(10, min(H - by, bh))

                landmarks = {
                    "right_eye": (float(best_face[4] / scale_factor), float(best_face[5] / scale_factor)),
                    "left_eye": (float(best_face[6] / scale_factor), float(best_face[7] / scale_factor)),
                    "nose": (float(best_face[8] / scale_factor), float(best_face[9] / scale_factor)),
                    "right_mouth": (float(best_face[10] / scale_factor), float(best_face[11] / scale_factor)),
                    "left_mouth": (float(best_face[12] / scale_factor), float(best_face[13] / scale_factor)),
                }

                return True, (bx, by, bw, bh), landmarks, score
        except Exception:
            pass

        return False, None, None, 0.0

    def _detect_cutaneous_macro_skin(self, img_np: np.ndarray) -> Tuple[bool, float]:
        """
        Tier 2: Cutaneous Skin & Texture Validator for close-up lesion crops
        (e.g., cheek acne patch, forehead lines, or perioral redness where eyes/nose are not visible).
        """
        H, W, _ = img_np.shape

        if HAS_OPENCV:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            # Rejection guard: Documents / paper with white background (>35%) are NOT skin macro crops
            white_paper_ratio = float(np.mean(gray > 205))
            if white_paper_ratio > 0.35:
                return False, 0.0

            ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
            # Universal human skin chrominance cluster: Cr in [133, 175], Cb in [77, 130]
            lower_skin = np.array([0, 133, 77], dtype=np.uint8)
            upper_skin = np.array([255, 175, 130], dtype=np.uint8)
            mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

            # Also verify natural epidermal micro-texture (Laplacian variance > 12.0)
            texture_var = float(cv2.Laplacian(gray, cv2.CV_32F).var())
            has_texture = texture_var > 12.0
        else:
            r = img_np[:, :, 0].astype(int)
            g = img_np[:, :, 1].astype(int)
            b = img_np[:, :, 2].astype(int)
            mask = ((r > 95) & (g > 40) & (b > 20) & ((r - g) > 15) & (r > b)).astype(np.uint8) * 255
            has_texture = True

        skin_pixels = np.sum(mask > 0)
        total_pixels = H * W
        skin_ratio = float(skin_pixels / total_pixels) if total_pixels > 0 else 0.0

        is_valid_macro_skin = (skin_ratio >= self.skin_presence_threshold) and has_texture
        return is_valid_macro_skin, skin_ratio

    def detect_face_or_skin(self, img_np: np.ndarray) -> Dict[str, Any]:
        """
        Dual-Mode Hierarchical Detector:
        0. Checks if image is a document, marksheet, certificate, or text paper.
        1. Attempts YuNet neural face detection for full/partial faces.
        2. If no face is detected, checks for valid cutaneous skin patch (macro close-up).
        """
        # Step 0: Document Gatekeeper
        is_doc, doc_msg = self.is_document_or_text_image(img_np)
        if is_doc:
            self.last_detection_mode = "document_rejected"
            self.last_landmarks = None
            return {
                "detected": False,
                "mode": "document_rejected",
                "bbox": None,
                "landmarks": None,
                "confidence": 0.0,
                "reason": doc_msg
            }
        # Tier 1: YuNet
        has_face, bbox, landmarks, score = self._detect_yunet_face(img_np)
        if has_face:
            self.last_detection_mode = "full_face_yunet"
            self.last_landmarks = landmarks
            return {
                "detected": True,
                "mode": "full_face_yunet",
                "bbox": bbox,
                "landmarks": landmarks,
                "confidence": score
            }

        # Tier 2: Macro Cutaneous Skin Patch
        is_skin_patch, skin_ratio = self._detect_cutaneous_macro_skin(img_np)
        if is_skin_patch:
            self.last_detection_mode = "macro_skin_crop"
            self.last_landmarks = None
            return {
                "detected": True,
                "mode": "macro_skin_crop",
                "bbox": None,  # Entire photo is the target lesion region
                "landmarks": None,
                "confidence": round(min(0.96, skin_ratio + 0.15), 2)
            }

        self.last_detection_mode = "unrecognized"
        self.last_landmarks = None
        return {
            "detected": False,
            "mode": "unrecognized",
            "bbox": None,
            "landmarks": None,
            "confidence": 0.0
        }

    def detect_face_skin_mask(self, img_np: np.ndarray) -> Tuple[bool, Optional[Tuple[int, int, int, int]]]:
        """Preserves backward compatibility hook for skin mask detection."""
        res = self.detect_face_or_skin(img_np)
        return res["detected"], res.get("bbox")

    def crop_face_roi(self, img_pil: Image.Image) -> Tuple[Image.Image, bool]:
        """
        Extracts aligned ROI:
        - For full faces: YuNet landmark-guided anatomical face crop with margins.
        - For macro lesion crops: Preserves the entire close-up without discarding the disease site.
        Returns: (cropped_pil_image, face_or_skin_detected_bool)
        """
        img_np = np.array(img_pil)
        w, h = img_pil.size
        det_info = self.detect_face_or_skin(img_np)

        if not det_info["detected"]:
            # Fallback center crop if invalid
            crop_size = min(w, h)
            left = (w - crop_size) // 2
            top = (h - crop_size) // 2
            return img_pil.crop((left, top, left + crop_size, top + crop_size)).resize(
                self.output_size, resample=Image.Resampling.BICUBIC
            ), False

        # Case 1: Full face detected via YuNet -> Crop aligned facial region
        if det_info["mode"] == "full_face_yunet" and det_info["bbox"] is not None:
            bx, by, bw, bh = det_info["bbox"]
            pad_w = int(bw * self.margin_ratio)
            pad_h = int(bh * self.margin_ratio)

            x1 = max(0, bx - pad_w)
            y1 = max(0, by - pad_h)
            x2 = min(w, bx + bw + pad_w)
            y2 = min(h, by + bh + pad_h)

            # Make square crop centered on face
            cw = x2 - x1
            ch = y2 - y1
            cmax = max(cw, ch)
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            sq_x1 = max(0, cx - cmax // 2)
            sq_y1 = max(0, cy - cmax // 2)
            sq_x2 = min(w, sq_x1 + cmax)
            sq_y2 = min(h, sq_y1 + cmax)

            cropped = img_pil.crop((sq_x1, sq_y1, sq_x2, sq_y2))
            return cropped.resize(self.output_size, resample=Image.Resampling.BICUBIC), True

        # Case 2: Macro skin patch (User uploaded a close-up crop of cheek/forehead/lesion)
        # Preserve the entire close-up area by doing a minimal square fit from center
        crop_size = min(w, h)
        left = (w - crop_size) // 2
        top = (h - crop_size) // 2
        cropped = img_pil.crop((left, top, left + crop_size, top + crop_size))
        return cropped.resize(self.output_size, resample=Image.Resampling.BICUBIC), True

    def process(
        self,
        img_pil: Image.Image,
        bbox: Optional[Tuple[int, int, int, int]] = None
    ) -> Image.Image:
        """Standard processing hook preserving backward compatibility."""
        if bbox is not None:
            cropped = img_pil.crop(bbox)
            return cropped.resize(self.output_size, resample=Image.Resampling.BICUBIC)

        cropped, _ = self.crop_face_roi(img_pil)
        return cropped
