"""
DermaNova Image Enhancement & Low-Resolution Preprocessing Module
===================================================================
Applies CLAHE (Contrast-Limited Adaptive Histogram Equalization) and Bicubic
Spatial Upscaling to sub-224px skin crops (e.g. 1,282 low-res acne crops in GlowMix).
"""

import numpy as np
from PIL import Image, ImageEnhance
from typing import Tuple, Union, Optional

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False


class ImageEnhancer:
    def __init__(self, target_size: Tuple[int, int] = (224, 224), clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)):
        self.target_size = target_size
        self.clip_limit = clip_limit
        self.tile_grid_size = tile_grid_size

    def apply_clahe(self, img_np: np.ndarray) -> np.ndarray:
        """
        Apply Contrast-Limited Adaptive Histogram Equalization (CLAHE)
        to an RGB numpy array (H, W, C).
        """
        if not HAS_OPENCV:
            # Fallback using PIL AutoContrast
            img_pil = Image.fromarray(img_np)
            enhancer = ImageEnhance.Contrast(img_pil)
            return np.array(enhancer.enhance(1.2))

        # Convert RGB to LAB color space
        lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Apply CLAHE to L-channel
        clahe = cv2.createCLAHE(clipLimit=self.clip_limit, tileGridSize=self.tile_grid_size)
        cl = clahe.apply(l)

        # Merge channels and convert back to RGB
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

    def upscale_low_res(self, img_pil: Image.Image) -> Image.Image:
        """
        Apply Bicubic super-resolution upscaling if image dimensions are below target threshold.
        """
        w, h = img_pil.size
        target_w, target_h = self.target_size

        if w < target_w or h < target_h:
            # Use Bicubic resampling for smooth detail preservation
            img_pil = img_pil.resize((target_w, target_h), resample=Image.Resampling.BICUBIC)
        
        return img_pil

    def preprocess_image(self, img_input: Union[str, Image.Image, np.ndarray]) -> np.ndarray:
        """
        Complete preprocessing pipeline:
        1. Load image
        2. Bicubic upscaling if sub-resolution
        3. CLAHE adaptive contrast enhancement
        4. Target resize
        Returns RGB numpy array of target_size.
        """
        if isinstance(img_input, str):
            img_pil = Image.open(img_input).convert("RGB")
        elif isinstance(img_input, np.ndarray):
            img_pil = Image.fromarray(img_input).convert("RGB")
        else:
            img_pil = img_input.convert("RGB")

        # Step 1: Bicubic upscaling if low-res
        img_pil = self.upscale_low_res(img_pil)

        # Step 2: Convert to numpy array
        img_np = np.array(img_pil)

        # Step 3: Apply CLAHE contrast enhancement
        img_enhanced = self.apply_clahe(img_np)

        # Step 4: Ensure exact target size
        final_pil = Image.fromarray(img_enhanced).resize(self.target_size, resample=Image.Resampling.BICUBIC)
        return np.array(final_pil)
