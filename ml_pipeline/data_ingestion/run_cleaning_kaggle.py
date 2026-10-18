#!/usr/bin/env python3
"""
DermaNova Dataset Cleaning Execution Script (Kaggle Environment)
=================================================================
Runs production dataset cleaning, multi-label target encoding,
MD5 & pHash deduplication, and zero-leakage 70/15/15 group stratified splitting.

Mount Paths in Kaggle:
  DS-001: /kaggle/input/facial-skin-acne-pigmentation-pores-wrinkles
  DS-002: /kaggle/input/datasets/drishyatomar/glowmix-merged-facial-skincare-dataset/Skin Issues Dataset/Skin v2
"""

import sys
from pathlib import Path
from ml_pipeline.data_ingestion.clean_dataset import DatasetCleaner


def main():
    ds001_path = Path("/kaggle/input/facial-skin-acne-pigmentation-pores-wrinkles")
    ds002_path = Path("/kaggle/input/datasets/drishyatomar/glowmix-merged-facial-skincare-dataset/Skin Issues Dataset/Skin v2")
    output_dir = Path("./datasets/annotations")

    # Local fallback for non-Kaggle environments
    if not ds001_path.exists():
        ds001_path = Path("datasets/raw/facial-skin-acne-pigmentation-pores-wrinkles")
    if not ds002_path.exists():
        ds002_path = Path("datasets/raw/glowmix-merged-facial-skincare-dataset/Skin Issues Dataset/Skin v2")

    print("============================================================")
    print("DERMANOVA PRODUCTION DATASET CLEANER & SPLITTER")
    print("============================================================")
    print(f"DS-001 Path: {ds001_path} (Exists: {ds001_path.exists()})")
    print(f"DS-002 Path: {ds002_path} (Exists: {ds002_path.exists()})")
    print(f"Output Dir:  {output_dir.resolve()}")
    print("============================================================")

    cleaner = DatasetCleaner(
        ds001_dir=str(ds001_path) if ds001_path.exists() else None,
        ds002_dir=str(ds002_path) if ds002_path.exists() else None,
        output_dir=str(output_dir),
    )

    cleaner.process_and_clean(train_ratio=0.70, val_ratio=0.15)


if __name__ == "__main__":
    main()
