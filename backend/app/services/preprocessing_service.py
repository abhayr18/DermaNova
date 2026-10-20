"""
DermaNova Preprocessing Consistency Service
============================================
Reproduces the exact training preprocessing pipeline:
1. RGB image conversion
2. Bicubic upscaling if sub-224px resolution
3. LAB CLAHE adaptive contrast enhancement:
   - Convert to LAB color space
   - Apply CLAHE to L-channel (clipLimit=2.0, tileGridSize=(8, 8))
   - Convert back to RGB
4. Bicubic resize to target resolution (224, 224)
5. Float32 tensor conversion: [0.0, 1.0] range, channel order (C, H, W)
6. ImageNet normalization:
   - mean = [0.485, 0.456, 0.406]
   - std  = [0.229, 0.224, 0.225]
"""

import logging
from typing import Tuple, Union, Any
import numpy as np
from PIL import Image

try:
    import torch
    HAS_TORCH = True
except ImportError:
    torch = None
    HAS_TORCH = False

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

logger = logging.getLogger("dermanova.services.preprocessing")

# Standard ImageNet statistics (verified from training notebook)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class PreprocessingService:
    def __init__(
        self,
        target_size: Tuple[int, int] = (224, 224),
        clahe_clip_limit: float = 2.0,
        clahe_tile_grid: Tuple[int, int] = (8, 8)
    ):
        self.target_size = target_size
        self.clahe_clip_limit = clahe_clip_limit
        self.clahe_tile_grid = clahe_tile_grid

    def upscale_low_res(self, img_pil: Image.Image) -> Image.Image:
        """Upscale image using Bicubic resampling if dimensions are smaller than target."""
        w, h = img_pil.size
        target_w, target_h = self.target_size
        if w < target_w or h < target_h:
            return img_pil.resize((target_w, target_h), resample=Image.Resampling.BICUBIC)
        return img_pil

    def apply_clahe(self, img_np: np.ndarray) -> np.ndarray:
        """
        Applies Contrast-Limited Adaptive Histogram Equalization (CLAHE) on L channel in LAB space.
        Input: RGB uint8 numpy array (H, W, 3).
        Output: RGB uint8 numpy array (H, W, 3).
        """
        if not HAS_OPENCV:
            return img_np

        lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=self.clahe_clip_limit, tileGridSize=self.clahe_tile_grid)
        cl = clahe.apply(l)

        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

    def enhance_and_resize(self, pil_img: Image.Image) -> np.ndarray:
        """
        Runs full image enhancement matching ImageEnhancer in training:
        1. Bicubic upscaling
        2. LAB CLAHE
        3. Final bicubic resize to target_size (224, 224)
        Returns: RGB uint8 numpy array (224, 224, 3)
        """
        rgb_img = pil_img.convert("RGB")
        upscaled = self.upscale_low_res(rgb_img)
        enhanced_np = self.apply_clahe(np.array(upscaled))
        final_pil = Image.fromarray(enhanced_np).resize(self.target_size, resample=Image.Resampling.BICUBIC)
        return np.array(final_pil, dtype=np.uint8)

    def preprocess_to_tensor(self, img_input: Union[Image.Image, np.ndarray]) -> torch.Tensor:
        """
        Preprocesses an image to a normalized PyTorch tensor ready for inference.
        Returns: Float32 Tensor of shape (1, 3, 224, 224).
        """
        if isinstance(img_input, np.ndarray):
            pil_img = Image.fromarray(img_input).convert("RGB")
        else:
            pil_img = img_input.convert("RGB")

        # Step 1: Enhance and resize
        enhanced_np = self.enhance_and_resize(pil_img)

        # Step 2: Convert to float32 in [0.0, 1.0]
        img_float = enhanced_np.astype(np.float32) / 255.0

        # Step 3: ImageNet normalization (img - mean) / std
        img_norm = (img_float - IMAGENET_MEAN) / IMAGENET_STD

        # Step 4: Transpose from (H, W, C) to (C, H, W) and add batch dimension (1, C, H, W)
        tensor_chw = np.transpose(img_norm, (2, 0, 1))
        if HAS_TORCH and torch is not None:
            tensor = torch.from_numpy(tensor_chw).float().unsqueeze(0)
            return tensor
        # Return float32 numpy array with batch dim for ONNX
        return np.expand_dims(tensor_chw, axis=0).astype(np.float32)


# Global service instance
preprocessing_service = PreprocessingService()
