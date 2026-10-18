#!/usr/bin/env python3
"""
DermaNova Kaggle GPU Automated Training Runner
================================================
Single-command runner optimized for Kaggle GPU environments (T4 / P100).
Executes:
1. Data cleaning & verification on mounted Kaggle datasets
2. Group-stratified 70/15/15 train/val/test splits
3. Multi-task EfficientNet-B0 training with Asymmetric Focal Loss & Cosine Annealing
4. Generates dermanova_best_weights.pth and dermanova_model.onnx
"""

import os
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.data_ingestion.clean_dataset import DatasetCleaner
from ml_pipeline.training.train import run_training


def main():
    print("=" * 65)
    print("DERMANOVA KAGGLE END-TO-END GPU TRAINING RUNNER")
    print("=" * 65)

    # 1. Resolve Dataset Paths
    ds001_kaggle = Path("/kaggle/input/facial-skin-acne-pigmentation-pores-wrinkles")
    ds002_kaggle = Path("/kaggle/input/datasets/drishyatomar/glowmix-merged-facial-skincare-dataset/Skin Issues Dataset/Skin v2")

    # Local fallback paths
    ds001_local = ROOT_DIR / "datasets" / "raw" / "facial-skin-acne-pigmentation-pores-wrinkles"
    ds002_local = ROOT_DIR / "datasets" / "raw" / "glowmix-merged-facial-skincare-dataset" / "Skin Issues Dataset" / "Skin v2"

    ds001_path = ds001_kaggle if ds001_kaggle.exists() else ds001_local
    ds002_path = ds002_kaggle if ds002_kaggle.exists() else ds002_local

    output_annot_dir = ROOT_DIR / "datasets" / "annotations"
    saved_models_dir = ROOT_DIR / "ml_pipeline" / "models" / "saved_models"
    saved_models_dir.mkdir(parents=True, exist_ok=True)

    print(f"Dataset 1 (DS-001): {ds001_path} [Exists: {ds001_path.exists()}]")
    print(f"Dataset 2 (DS-002): {ds002_path} [Exists: {ds002_path.exists()}]")

    # 2. Run Data Cleaning & Stratified Splitting if source datasets are mounted
    train_csv = output_annot_dir / "dermanova_train_split.csv"
    val_csv = output_annot_dir / "dermanova_val_split.csv"

    if ds001_path.exists() or ds002_path.exists():
        print("\n[Step 1/2] Processing raw datasets into zero-leakage stratified splits...")
        cleaner = DatasetCleaner(
            ds001_dir=str(ds001_path) if ds001_path.exists() else None,
            ds002_dir=str(ds002_path) if ds002_path.exists() else None,
            output_dir=str(output_annot_dir)
        )
        cleaner.process_and_clean(train_ratio=0.70, val_ratio=0.15)
    else:
        print(f"\n[Step 1/2] Using existing split annotations in {output_annot_dir}")

    # 3. Launch Deep Learning Training
    print("\n[Step 2/2] Launching Multi-Task Deep Learning Training...")
    run_training(
        train_csv=str(train_csv),
        val_csv=str(val_csv),
        epochs=35,
        batch_size=32,
        lr=3e-4,
        backbone="efficientnet_b0",
        save_dir=str(saved_models_dir)
    )

    print("\n" + "=" * 65)
    print("KAGGLE TRAINING RUN FINISHED!")
    print(f"Checkpoints exported to: {saved_models_dir.resolve()}")
    print("=" * 65)


if __name__ == "__main__":
    main()
