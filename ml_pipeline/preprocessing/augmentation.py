"""
DermaNova Albumentations Data Augmentation Pipeline
====================================================
Provides production training and evaluation augmentation pipelines using
Albumentations (or PyTorch/PIL fallbacks). Includes targeted augmentation
for under-represented classes (e.g. Whiteheads).
"""

from typing import Tuple, Dict, Any, Optional
import numpy as np
from PIL import Image

try:
    import albumentations as A
    from albumentations.pytorch import ToTensorV2
    HAS_ALBUMENTATIONS = True
except ImportError:
    HAS_ALBUMENTATIONS = False

# ImageNet normalization statistics
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


class DermaNovaAugmenter:
    def __init__(self, image_size: Tuple[int, int] = (224, 224)):
        self.image_size = image_size
        self._init_albumentations_pipelines()

    def _init_albumentations_pipelines(self):
        if not HAS_ALBUMENTATIONS:
            return

        h, w = self.image_size

        # Standard Training Pipeline for Multi-Label CNN Heads
        self.train_transform = A.Compose([
            A.Resize(h, w),
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(brightness_limit=0.15, contrast_limit=0.15, p=0.5),
            A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=15, p=0.5),
            A.CLAHE(clip_limit=2.0, tile_grid_size=(8, 8), p=0.3),
            A.GaussNoise(var_limit=(10.0, 50.0), p=0.2),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])

        # Heavy Augmentation Pipeline for Targeted Under-Represented Classes (e.g., Whiteheads)
        self.targeted_whiteheads_transform = A.Compose([
            A.Resize(h, w),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.2),
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.7),
            A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.15, rotate_limit=25, p=0.7),
            A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=0.5),
            A.HueSaturationValue(hue_shift_limit=10, sat_shift_limit=15, val_shift_limit=10, p=0.4),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])

        # Validation & Testing Pipeline (Deterministic)
        self.val_transform = A.Compose([
            A.Resize(h, w),
            A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ToTensorV2()
        ])

    def augment(self, image_np: np.ndarray, is_train: bool = True, is_whitehead: bool = False) -> Dict[str, Any]:
        """
        Apply augmentation to an RGB numpy image array.
        Returns dict with key 'image' containing float tensor or transformed numpy array.
        """
        if HAS_ALBUMENTATIONS:
            if not is_train:
                return self.val_transform(image=image_np)
            elif is_whitehead:
                return self.targeted_whiteheads_transform(image=image_np)
            else:
                return self.train_transform(image=image_np)
        else:
            # Fallback PyTorch/Numpy normalization pipeline
            img_normalized = (image_np.astype(np.float32) / 255.0 - IMAGENET_MEAN) / IMAGENET_STD
            # Convert HWC to CHW
            tensor_chw = np.transpose(img_normalized, (2, 0, 1))
            return {"image": tensor_chw}
