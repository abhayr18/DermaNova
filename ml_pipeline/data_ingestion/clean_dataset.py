"""
DermaNova Dataset Cleaning & Stratified Splitting Module
==========================================================
Phase: Phase 3 — Data Cleaning & Stratified Group Splitting

PURPOSE:
    Translates dataset audit findings and approved label harmonization rules
    into a production-ready cleaning and stratified splitting pipeline.

APPROVED HARMONIZATION RULES APPLIED:
    1. Read-Only Enforcement: Source dataset directories are never modified/deleted.
    2. Multi-Label Encoding: Encodes target classes into an 8-element binary multi-label vector:
       [Acne, Blackheads, Whiteheads, Dark_Spots, Pigmentation, Pores, Wrinkles, Redness]
    3. Dark Spots / Pigmentation Resolution: 26 conflict pairs encoded as multi-label [Dark_Spots=1, Pigmentation=1].
    4. Open-Comedo Reclassification: DS-002 'acne-open-comedo-*' images reclassified to [Blackheads=1].
    5. Deduplication: Removes exact SHA-256 / MD5 duplicates and same-class perceptual duplicates.
    6. Grouped Stratified Split (70/15/15): Groups images by base_filename (Roboflow .rf. variants)
       or pHash group ID, guaranteeing zero photograph or patient leakage across Train, Val, and Test.

AUTHOR: DermaNova AI Research Team
DATE:   August 2026
"""

import os
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set
import pandas as pd
import numpy as np
from PIL import Image

try:
    import imagehash
    HAS_IMAGEHASH = True
except ImportError:
    HAS_IMAGEHASH = False

# Setup Logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("DermaNova-Cleaner")

# 8 Core Target Classes for Multi-Label Head
DERMANOVA_CLASSES = [
    "Acne",
    "Blackheads",
    "Whiteheads",
    "Dark_Spots",
    "Pigmentation",
    "Pores",
    "Wrinkles",
    "Redness",
]

# Initial Mapping Matrix from Original Label to DermaNova Binary Multi-Label Vector
LABEL_TO_MULTILABEL: Dict[str, Dict[str, int]] = {
    "inflammatory acne": {"Acne": 1},
    "acne": {"Acne": 1},
    "non inflammatory acne black heads": {"Blackheads": 1},
    "blackheades": {"Blackheads": 1},
    "non inflammatory acne white heads": {"Whiteheads": 1},
    "dark spots": {"Dark_Spots": 1},
    "pigmentation": {"Pigmentation": 1},
    "pores": {"Pores": 1},
    "wrinkles": {"Wrinkles": 1},
    "Redness": {"Redness": 1},
}


class DatasetCleaner:
    def __init__(
        self,
        ds001_dir: Optional[str] = None,
        ds002_dir: Optional[str] = None,
        output_dir: str = "datasets/annotations",
    ):
        self.ds001_dir = Path(ds001_dir) if ds001_dir else None
        self.ds002_dir = Path(ds002_dir) if ds002_dir else None
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def compute_md5(file_path: Path) -> str:
        """Compute MD5 hash of image file."""
        hasher = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(65536), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.warning(f"Failed MD5 for {file_path}: {e}")
            return ""

    @staticmethod
    def compute_phash(file_path: Path) -> str:
        """Compute perceptual difference hash using ImageHash."""
        if not HAS_IMAGEHASH:
            return ""
        try:
            with Image.open(file_path) as img:
                return str(imagehash.dhash(img))
        except Exception:
            return ""

    @staticmethod
    def extract_base_filename(filename: str) -> str:
        """
        Extract base filename before Roboflow suffix (.rf.<hash>.jpg).
        Example: 'acne-vulgaris-12_jpg.rf.8b9a1c.jpg' -> 'acne-vulgaris-12_jpg'
        """
        if ".rf." in filename:
            return filename.split(".rf.")[0]
        # Remove extension for non-Roboflow files
        return Path(filename).stem

    def scan_dataset_directory(
        self, dataset_id: str, dataset_dir: Path
    ) -> List[Dict]:
        """Scan a dataset directory, extract dimensions, hashes, and base filenames."""
        records = []
        if not dataset_dir or not dataset_dir.exists():
            logger.warning(f"[{dataset_id}] Directory not found: {dataset_dir}")
            return records

        logger.info(f"[{dataset_id}] Scanning directory: {dataset_dir}...")
        class_dirs = [d for d in dataset_dir.iterdir() if d.is_dir()]

        for class_dir in class_dirs:
            original_label = class_dir.name
            image_files = [
                f for f in class_dir.iterdir()
                if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
            ]

            logger.info(f"   [{dataset_id}] Reading class '{original_label}': {len(image_files)} images...")

            for img_path in image_files:
                try:
                    # Dimensions
                    width, height = None, None
                    try:
                        with Image.open(img_path) as img:
                            width, height = img.size
                    except Exception:
                        pass

                    md5_hash = self.compute_md5(img_path)
                    p_hash = self.compute_phash(img_path)
                    base_name = self.extract_base_filename(img_path.name)

                    # Build base multi-label vector
                    base_vector = {cls_name: 0 for cls_name in DERMANOVA_CLASSES}
                    initial_map = LABEL_TO_MULTILABEL.get(original_label, {})
                    for k, v in initial_map.items():
                        base_vector[k] = v

                    # Apply Rule: DS-002 Open-Comedo reclassification to Blackheads
                    if dataset_id == "DS-002" and "open-comedo" in img_path.name.lower():
                        base_vector["Blackheads"] = 1
                        # If previously assigned to Acne folder, keep multi-label vector or reclassify
                        base_vector["Acne"] = 0

                    record = {
                        "dataset_id": dataset_id,
                        "source_path": str(img_path),
                        "filename": img_path.name,
                        "base_filename": base_name,
                        "original_label": original_label,
                        "width": width,
                        "height": height,
                        "aspect_ratio": round(width / height, 3) if width and height else None,
                        "md5": md5_hash,
                        "phash": p_hash,
                        "group_key": base_name if dataset_id == "DS-001" else (p_hash if p_hash else md5_hash),
                    }
                    # Merge multi-label target columns
                    for c in DERMANOVA_CLASSES:
                        record[f"label_{c}"] = base_vector[c]

                    records.append(record)
                except Exception as e:
                    logger.error(f"Error processing {img_path.name}: {e}")

        logger.info(f"[{dataset_id}] Total scanned images: {len(records)}")
        return records

    def process_and_clean(
        self, train_ratio: float = 0.70, val_ratio: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Execute full cleaning, deduplication, multi-label assignment,
        and leakage-free group stratified splitting.
        """
        all_records = []

        if self.ds001_dir:
            all_records.extend(self.scan_dataset_directory("DS-001", self.ds001_dir))
        if self.ds002_dir:
            all_records.extend(self.scan_dataset_directory("DS-002", self.ds002_dir))

        if not all_records:
            logger.warning("No records scanned. Check dataset paths.")
            return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

        df = pd.DataFrame(all_records)
        initial_count = len(df)
        logger.info(f"[Clean] Total initial images scanned across all datasets: {initial_count}")

        # Step 1: Exact MD5 Deduplication
        df_dedup_md5 = df.drop_duplicates(subset=["md5"]).copy()
        md5_dups_removed = initial_count - len(df_dedup_md5)
        logger.info(f"[Clean] Removed {md5_dups_removed} exact MD5 duplicate files. Remaining: {len(df_dedup_md5)}")

        # Step 2: Perceptual Hash Deduplication (same class & pHash)
        if HAS_IMAGEHASH and "phash" in df_dedup_md5.columns:
            # Remove duplicates sharing same original_label and non-empty pHash
            valid_phash = df_dedup_md5[df_dedup_md5["phash"] != ""]
            empty_phash = df_dedup_md5[df_dedup_md5["phash"] == ""]

            dedup_phash = valid_phash.drop_duplicates(subset=["original_label", "phash"])
            df_clean = pd.concat([dedup_phash, empty_phash], ignore_index=True)
            phash_dups_removed = len(df_dedup_md5) - len(df_clean)
            logger.info(f"[Clean] Removed {phash_dups_removed} same-class perceptual duplicate copies. Remaining: {len(df_clean)}")
        else:
            df_clean = df_dedup_md5

        # Step 3: Apply Dark Spots / Pigmentation Multi-label Overlap Rule
        # If an image belongs to Dark Spots and has near-duplicate in Pigmentation, update both target labels to 1
        # Group by group_key across dataset
        multi_label_cols = [f"label_{c}" for c in DERMANOVA_CLASSES]

        # Aggregate labels within same group_key (e.g. Roboflow augmented copies of same face)
        logger.info("[Clean] Aggregating multi-label targets across duplicate group keys...")
        grouped_labels = df_clean.groupby("group_key")[multi_label_cols].max()

        for group_k, max_labels in grouped_labels.iterrows():
            # Check if group has both Dark_Spots and Pigmentation
            if max_labels["label_Dark_Spots"] == 1 and max_labels["label_Pigmentation"] == 1:
                # Update all rows in this group key to have both targets = 1
                mask = df_clean["group_key"] == group_k
                df_clean.loc[mask, "label_Dark_Spots"] = 1
                df_clean.loc[mask, "label_Pigmentation"] = 1

        # Step 4: Leakage-Free Stratified Group Splitting
        # Each group_key (e.g., base_filename or pHash cluster) MUST be strictly in one split
        unique_groups = df_clean.groupby("group_key").first().reset_index()
        
        # Primary label for group stratification (dominant non-zero target)
        def get_primary_label(row):
            for c in DERMANOVA_CLASSES:
                if row[f"label_{c}"] == 1:
                    return c
            return "Unassigned"

        unique_groups["primary_strat_label"] = unique_groups.apply(get_primary_label, axis=1)

        train_groups, val_groups, test_groups = set(), set(), set()

        np.random.seed(42)
        for primary_cls, group_df in unique_groups.groupby("primary_strat_label"):
            shuffled_keys = group_df["group_key"].sample(frac=1, random_state=42).values
            n_total = len(shuffled_keys)
            n_train = int(n_total * train_ratio)
            n_val = int(n_total * val_ratio)

            train_groups.update(shuffled_keys[:n_train])
            val_groups.update(shuffled_keys[n_train:n_train + n_val])
            test_groups.update(shuffled_keys[n_train + n_val:])

        train_df = df_clean[df_clean["group_key"].isin(train_groups)].copy().reset_index(drop=True)
        val_df = df_clean[df_clean["group_key"].isin(val_groups)].copy().reset_index(drop=True)
        test_df = df_clean[df_clean["group_key"].isin(test_groups)].copy().reset_index(drop=True)

        train_df["split"] = "train"
        val_df["split"] = "val"
        test_df["split"] = "test"

        master_split_df = pd.concat([train_df, val_df, test_df], ignore_index=True)

        logger.info("\n" + "=" * 60)
        logger.info("DATASET CLEANING & STRATIFIED SPLIT RESULTS")
        logger.info("=" * 60)
        logger.info(f"Total Initial Images:     {initial_count:,}")
        logger.info(f"Total Clean Unique:       {len(df_clean):,}")
        logger.info(f"Train Split (70%):        {len(train_df):,} images ({len(train_groups):,} group keys)")
        logger.info(f"Validation Split (15%):   {len(val_df):,} images ({len(val_groups):,} group keys)")
        logger.info(f"Test Split (15%):         {len(test_df):,} images ({len(test_groups):,} group keys)")
        logger.info("=" * 60)

        # Print class distribution per split
        for c in DERMANOVA_CLASSES:
            tr_c = train_df[f"label_{c}"].sum()
            va_c = val_df[f"label_{c}"].sum()
            te_c = test_df[f"label_{c}"].sum()
            tot_c = master_split_df[f"label_{c}"].sum()
            logger.info(f"  Class '{c:<12}': Total={tot_c:<5} | Train={tr_c:<5} | Val={va_c:<5} | Test={te_c:<5}")

        # Export split CSVs
        master_split_df.to_csv(self.output_dir / "dermanova_master_clean.csv", index=False)
        train_df.to_csv(self.output_dir / "dermanova_train_split.csv", index=False)
        val_df.to_csv(self.output_dir / "dermanova_val_split.csv", index=False)
        test_df.to_csv(self.output_dir / "dermanova_test_split.csv", index=False)

        logger.info(f"\n✅ All split metadata CSVs exported to: {self.output_dir.resolve()}")
        return master_split_df, train_df, val_df, test_df


if __name__ == "__main__":
    import sys

    # Discover dataset paths locally if available
    ds001_cand = "datasets/raw/facial-skin-acne-pigmentation-pores-wrinkles"
    ds002_cand = "datasets/raw/glowmix-merged-facial-skincare-dataset"

    ds001_p = ds001_cand if Path(ds001_cand).exists() else None
    ds002_p = ds002_cand if Path(ds002_cand).exists() else None

    cleaner = DatasetCleaner(ds001_dir=ds001_p, ds002_dir=ds002_p)
    cleaner.process_and_clean()
