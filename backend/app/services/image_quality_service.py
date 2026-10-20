"""
DermaNova Image Quality & Face Presence Service
================================================
Performs clinical optical gatekeeping:
1. Blur detection (Laplacian variance threshold)
2. Exposure analysis (overexposure / underexposure / pitch black / blank canvas)
3. Fitzpatrick human facial skin chrominance presence check (YCrCb / HSV)
4. Returns actionable, clear rejection guidance when image is unsuitable
"""

import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

from backend.app.core.exceptions import ImageQualityError

logger = logging.getLogger("dermanova.services.image_quality")


class ImageQualityService:
    def __init__(
        self,
        blur_threshold: float = 65.0,
        min_luminance: float = 35.0,
        max_luminance: float = 235.0,
        min_skin_fraction: float = 0.10
    ):
        self.blur_threshold = blur_threshold
        self.min_luminance = min_luminance
        self.max_luminance = max_luminance
        self.min_skin_fraction = min_skin_fraction

    def evaluate_quality_and_suitability(self, pil_img: Image.Image) -> Dict[str, Any]:
        """
        Evaluates optical clarity, exposure, and human face/skin presence.
        Raises ImageQualityError with clear actionable explanation if unsuitable.
        """
        img_np = np.array(pil_img)
        H, W = img_np.shape[:2]

        # 1. Luminance & Exposure check
        if HAS_OPENCV:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            mean_lum = float(np.mean(gray))
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        else:
            r = img_np[:, :, 0].astype(np.float32)
            g = img_np[:, :, 1].astype(np.float32)
            b = img_np[:, :, 2].astype(np.float32)
            gray = 0.299 * r + 0.587 * g + 0.114 * b
            mean_lum = float(np.mean(gray))
            laplacian_var = float(np.var(gray))

        # Blank white canvas / heavily overexposed
        if mean_lum > 240.0:
            raise ImageQualityError(
                "Image appears blank, solid white, or washed out. "
                "No visible facial skin features found. Please upload a clear photo of your face."
            )

        # Blank dark / heavily underexposed
        if mean_lum < 20.0:
            raise ImageQualityError(
                "Image is completely dark or underexposed (black image). "
                "No visible facial skin features found. Please upload a photo taken in adequate lighting."
            )

        # Check for uniform blank canvas (e.g. solid color)
        if laplacian_var < 8.0:
            raise ImageQualityError(
                "Image lacks visible facial skin texture or features (blank or solid color canvas). "
                "Please upload a real, clear clinical facial photo."
            )

        # Extreme blur check
        is_blurry = laplacian_var < self.blur_threshold

        # 2. Skin / Face Presence check (Fitzpatrick Chrominance Clustering)
        face_detected, skin_fraction, bbox = self._detect_skin_presence(img_np)

        if not face_detected:
            raise ImageQualityError(
                "No human face or valid facial skin region detected in the image. "
                "Please ensure your face is clearly visible, centered in the frame, and unobstructed."
            )

        if is_blurry:
            logger.info(f"Image blur score: {laplacian_var:.1f} (threshold: {self.blur_threshold})")
            # If extremely blurry, reject
            if laplacian_var < 20.0:
                raise ImageQualityError(
                    "Image is too blurry for accurate dermatological analysis. "
                    "Please hold your camera steady and retake the photo."
                )

        return {
            "is_valid": True,
            "blur_score": round(laplacian_var, 2),
            "is_blurry": is_blurry,
            "mean_luminance": round(mean_lum, 2),
            "face_detected": face_detected,
            "skin_fraction": round(skin_fraction, 4),
            "face_bounding_box": bbox
        }

    def _detect_skin_presence(self, img_np: np.ndarray) -> Tuple[bool, float, Optional[Tuple[int, int, int, int]]]:
        """
        Detects skin pixels across Fitzpatrick skin types I-VI.
        Returns (has_skin_face, skin_ratio, optional_bbox).
        """
        H, W = img_np.shape[:2]
        total_pixels = H * W

        if HAS_OPENCV:
            ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
            # Universal human skin chrominance cluster: Cr in [133, 175], Cb in [77, 130]
            lower_skin = np.array([0, 133, 77], dtype=np.uint8)
            upper_skin = np.array([255, 175, 130], dtype=np.uint8)
            mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
            skin_pixels = int(cv2.countNonZero(mask))
        else:
            # Fallback RGB skin tone heuristic
            r = img_np[:, :, 0].astype(np.int32)
            g = img_np[:, :, 1].astype(np.int32)
            b = img_np[:, :, 2].astype(np.int32)
            skin_mask = (r > 95) & (g > 40) & (b > 20) & ((r - g) > 15) & (r > b)
            skin_pixels = int(np.sum(skin_mask))

        skin_ratio = skin_pixels / max(total_pixels, 1)
        face_detected = skin_ratio >= self.min_skin_fraction

        bbox = None
        if face_detected and HAS_OPENCV:
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_c = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(largest_c)
                bbox = (int(x), int(y), int(w), int(h))

        return face_detected, skin_ratio, bbox

    def crop_face_roi(self, pil_img: Image.Image) -> Tuple[Image.Image, bool]:
        """
        Extracts facial region of interest preserving aspect ratio,
        centered on the skin area.
        """
        img_np = np.array(pil_img)
        face_detected, _, bbox = self._detect_skin_presence(img_np)

        if not face_detected or bbox is None:
            # Fallback to center square crop
            w, h = pil_img.size
            crop_size = min(w, h)
            left = (w - crop_size) // 2
            top = (h - crop_size) // 2
            return pil_img.crop((left, top, left + crop_size, top + crop_size)), face_detected

        # Pad bounding box by 15% margin
        x, y, bw, bh = bbox
        margin_x = int(bw * 0.15)
        margin_y = int(bh * 0.15)

        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(pil_img.width, x + bw + margin_x)
        y2 = min(pil_img.height, y + bh + margin_y)

        # Make square for CNN input
        cw = x2 - x1
        ch = y2 - y1
        cmax = max(cw, ch)
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2

        sq_x1 = max(0, cx - cmax // 2)
        sq_y1 = max(0, cy - cmax // 2)
        sq_x2 = min(pil_img.width, sq_x1 + cmax)
        sq_y2 = min(pil_img.height, sq_y1 + cmax)

        return pil_img.crop((sq_x1, sq_y1, sq_x2, sq_y2)), True


# Global service instance
image_quality_service = ImageQualityService()
