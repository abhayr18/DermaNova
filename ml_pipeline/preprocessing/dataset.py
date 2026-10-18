"""
DermaNova PyTorch Multi-Label Dataset & DataLoader Integration Module
======================================================================
Connects annotation split CSVs with on-the-fly ImageEnhancer, FaceROIExtractor,
and DermaNovaAugmenter transforms inside a PyTorch Dataset class.
"""

import os
import sys
from pathlib import Path
from typing import Optional, Dict, Tuple, Any

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

import pandas as pd
import numpy as np
from PIL import Image

try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    Dataset = object

from ml_pipeline.preprocessing.image_enhancement import ImageEnhancer
from ml_pipeline.preprocessing.face_alignment import FaceROIExtractor
from ml_pipeline.preprocessing.augmentation import DermaNovaAugmenter, IMAGENET_MEAN, IMAGENET_STD

DERMANOVA_CLASSES = [
    "Acne", "Blackheads", "Whiteheads", "Dark_Spots",
    "Pigmentation", "Pores", "Wrinkles", "Redness"
]


class DermaNovaSkinDataset(Dataset):
    """
    PyTorch Dataset for DermaNova Multi-Label Facial Skin Classification.
    Executes Bicubic Upscaling, LAB CLAHE, ROI Alignment, and Augmentations on-the-fly.
    """

    def __init__(
        self,
        csv_file: str,
        image_size: Tuple[int, int] = (224, 224),
        is_train: bool = True,
        ds_root_override: Optional[str] = None,
    ):
        self.csv_path = Path(csv_file)
        self.df = pd.read_csv(self.csv_path) if self.csv_path.exists() else pd.DataFrame()
        self.image_size = image_size
        self.is_train = is_train
        self.ds_root_override = ds_root_override

        # Preprocessing Modules
        self.enhancer = ImageEnhancer(target_size=image_size)
        self.roi_extractor = FaceROIExtractor(output_size=image_size)
        self.augmenter = DermaNovaAugmenter(image_size=image_size)

        self.label_cols = [f"label_{c}" for c in DERMANOVA_CLASSES]

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        if self.df.empty:
            raise IndexError("Dataset DataFrame is empty.")

        row = self.df.iloc[idx]
        img_path = Path(row["source_path"])

        # Override root path if provided
        if self.ds_root_override and not img_path.exists():
            img_path = Path(self.ds_root_override) / row["filename"]

        # 1. Load Image or Generate Mock Array if File Unreachable Locally
        if img_path.exists():
            img_pil = Image.open(img_path).convert("RGB")
        else:
            # Fallback mock synthetic skin patch tensor for local dry-runs
            img_pil = Image.new("RGB", self.image_size, color=(180, 120, 90))

        # 2. Extract Facial ROI Patch
        img_roi = self.roi_extractor.process(img_pil)

        # 3. Apply Bicubic Upscaling + LAB CLAHE Enhancement
        img_enhanced_np = self.enhancer.preprocess_image(img_roi)

        # 4. Check if targeted Whiteheads augmentation is required
        is_whitehead = bool(row.get("label_Whiteheads", 0) == 1)

        # 5. Apply Data Augmentations
        aug_dict = self.augmenter.augment(img_enhanced_np, is_train=self.is_train, is_whitehead=is_whitehead)
        img_tensor = aug_dict["image"]

        # 6. Extract Multi-Label Target Vector (8 floats)
        target_vector = np.array([float(row.get(col, 0)) for col in self.label_cols], dtype=np.float32)

        if HAS_TORCH:
            if not isinstance(img_tensor, torch.Tensor):
                img_tensor = torch.from_numpy(img_tensor).float()
            target_tensor = torch.from_numpy(target_vector).float()
        else:
            target_tensor = target_vector

        return {
            "image": img_tensor,
            "target": target_tensor,
            "filename": row["filename"],
            "dataset_id": row["dataset_id"],
        }


def create_dataloaders(
    train_csv: str,
    val_csv: str,
    test_csv: str,
    batch_size: int = 32,
    num_workers: int = 2,
    image_size: Tuple[int, int] = (224, 224),
) -> Tuple[Any, Any, Any]:
    """Factory function for creating Train, Validation, and Test PyTorch DataLoaders."""
    train_ds = DermaNovaSkinDataset(train_csv, image_size=image_size, is_train=True)
    val_ds = DermaNovaSkinDataset(val_csv, image_size=image_size, is_train=False)
    test_ds = DermaNovaSkinDataset(test_csv, image_size=image_size, is_train=False)

    if HAS_TORCH:
        train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
        val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
        test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    else:
        train_loader, val_loader, test_loader = train_ds, val_ds, test_ds

    return train_loader, val_loader, test_loader


if __name__ == "__main__":
    train_path = "datasets/annotations/dermanova_train_split.csv"
    val_path = "datasets/annotations/dermanova_val_split.csv"
    test_path = "datasets/annotations/dermanova_test_split.csv"

    print("============================================================")
    print("DERMANOVA PYTORCH DATASET & DATALOADER VERIFICATION")
    print("============================================================")
    dataset = DermaNovaSkinDataset(train_path, is_train=True)
    print(f"Total training samples in PyTorch Dataset: {len(dataset)}")
    if len(dataset) > 0:
        sample = dataset[0]
        print(f"Sample image tensor shape: {sample['image'].shape}")
        print(f"Sample target multi-label vector: {sample['target']}")
    print("============================================================")
