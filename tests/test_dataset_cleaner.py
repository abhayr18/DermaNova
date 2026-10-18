"""
DermaNova Dataset Cleaner & Stratified Splitter — Verification Suite
Tests the cleaning pipeline against simulated multi-class and multi-label samples.
"""

import os
import shutil
import tempfile
from pathlib import Path
import pandas as pd
from PIL import Image

from ml_pipeline.data_ingestion.clean_dataset import DatasetCleaner, DERMANOVA_CLASSES


def create_mock_image(path: Path, color=(200, 100, 100)):
    """Create a dummy image file for testing."""
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (256, 256), color=color)
    img.save(path)


def test_cleaning_and_splitting():
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_p = Path(tmp_dir)
        ds001_dir = tmp_p / "DS-001"
        ds002_dir = tmp_p / "DS-002"
        out_dir = tmp_p / "output"

        # Create mock images for DS-001
        for i in range(10):
            # Roboflow pattern
            create_mock_image(ds001_dir / "inflammatory acne" / f"acne_{i}.rf.hash{i}.jpg", color=(i*20, 50, 50))
            create_mock_image(ds001_dir / "dark spots" / f"darkspot_{i}.rf.hash{i}.jpg", color=(50, i*20, 50))
            create_mock_image(ds001_dir / "pigmentation" / f"pigment_{i}.rf.hash{i}.jpg", color=(50, 50, i*20))

        # Create mock images for DS-002
        for i in range(10):
            create_mock_image(ds002_dir / "acne" / f"acne-open-comedo-{i}.rf.hash{i}.jpg", color=(100, 100, i*15))
            create_mock_image(ds002_dir / "blackheades" / f"blackhead_{i}.jpg", color=(i*15, 100, 100))
            create_mock_image(ds002_dir / "wrinkles" / f"wrinkle_{i}.jpg", color=(100, i*15, 100))

        cleaner = DatasetCleaner(ds001_dir=str(ds001_dir), ds002_dir=str(ds002_dir), output_dir=str(out_dir))
        master_df, train_df, val_df, test_df = cleaner.process_and_clean(train_ratio=0.70, val_ratio=0.15)

        # Assertions
        assert not master_df.empty, "Master split DataFrame should not be empty"
        assert len(train_df) + len(val_df) + len(test_df) == len(master_df), "Split counts should sum to master count"
        
        # Check target label columns
        for c in DERMANOVA_CLASSES:
            col = f"label_{c}"
            assert col in master_df.columns, f"Missing multi-label column: {col}"

        # Check Open-Comedo reclassification
        open_comedo_rows = master_df[master_df["filename"].str.contains("open-comedo")]
        assert (open_comedo_rows["label_Blackheads"] == 1).all(), "Open-comedo images should be reclassified to Blackheads=1"

        print("\n[SUCCESS] All unit tests passed for Dataset Cleaner & Stratified Splitter!")


if __name__ == "__main__":
    test_cleaning_and_splitting()
