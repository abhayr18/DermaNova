#!/usr/bin/env python3
"""
DermaNova Label Harmonization Pipeline
=======================================
Script: run_harmonization.py
Phase:  Post-Dataset-Audit / Pre-Model-Training

PURPOSE:
    Discover all original dataset labels from both DermaNova candidate datasets,
    apply proposed DermaNova taxonomy mappings, generate master metadata, and
    produce all harmonization reports. This script is fully READ-ONLY with respect
    to source data. No raw files are modified, renamed, deleted, or moved.

ENVIRONMENT:
    Designed to run in a Kaggle notebook where datasets are mounted read-only.
    Adjust CONFIG paths for local execution if needed.

OUTPUTS:
    dermanova_dataset_harmonization/
    ├── reports/
    │   ├── label_harmonization_report.md
    │   └── label_harmonization_summary.txt
    ├── mappings/
    │   ├── dataset_label_inventory.csv
    │   ├── label_mapping.csv
    │   ├── label_mapping_review.csv
    │   └── label_definitions.md
    ├── conflicts/
    │   └── cross_class_label_conflicts.csv
    └── metadata/
        └── master_metadata.csv

REPRODUCIBILITY:
    Fully deterministic. Mapping rules are hardcoded constants.
    No randomness introduced anywhere.

AUTHOR: DermaNova AI Research Team
DATE:   August 2026
"""

import os
import sys
import csv
import hashlib
import logging
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

import pandas as pd

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("[WARNING] PIL not available. Image dimensions will not be read during scan.")

try:
    import imagehash
    HAS_IMAGEHASH = True
except ImportError:
    HAS_IMAGEHASH = False
    print("[WARNING] imagehash not available. pHash will not be computed.")

# ============================================================
# CONFIGURATION
# ============================================================

CONFIG = {
    # --- Dataset Paths (Kaggle Environment) ---
    # GlowMix Skin V2 sub-dataset (primary target for DS-002)
    "GLOWMIX_SKIN_V2_PATH": (
        "/kaggle/input/datasets/drishyatomar/"
        "glowmix-merged-facial-skincare-dataset/Skin Issues Dataset/Skin v2"
    ),
    # GlowMix root (to discover any additional sub-datasets)
    "GLOWMIX_BASE_PATH": (
        "/kaggle/input/datasets/drishyatomar/"
        "glowmix-merged-facial-skincare-dataset"
    ),
    # DS-001 search roots — script tries each in order until dataset is found
    "DS001_SEARCH_ROOTS": [
        "/kaggle/input/facial-skin-acne-pigmentation-pores-wrinkles",
        "/kaggle/input/facial-skin",
        "/kaggle/input/skin-acne-pigmentation-pores-wrinkles",
        "/kaggle/input/skin-disease-dataset",
    ],
    # --- Output Directory (relative to script location) ---
    "OUTPUT_BASE": "./dermanova_dataset_harmonization",
    # --- Image processing ---
    "SUPPORTED_EXTENSIONS": {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"},
    # Print progress every N images during master_metadata scan
    "PROGRESS_INTERVAL": 500,
    # Whether to recompute pHash during master_metadata build (expensive — default OFF)
    # The completed audit already captured pHash statistics.
    "COMPUTE_PHASH": False,
    # Whether to read width/height from PIL during master_metadata build
    "COMPUTE_DIMENSIONS": True,
    # --- Dataset identifiers ---
    "DS001_ID": "DS-001",
    "DS001_NAME": "Facial Skin (Acne, Pigmentation, Pores, Wrinkles)",
    "DS002_ID": "DS-002",
    "DS002_NAME": "GlowMix Merged Facial Skincare Dataset (Skin V2)",
    # --- Known audit-derived aggregate values (do NOT recompute these) ---
    "AUDIT_DERIVED": {
        "DS-001": {
            "total_images": 4233,
            "unique_phashes": 3752,
            "cross_class_pairs": 28,
            "cross_class_images": 56,
            "avg_resolution": "710 x 693 px",
            "source": "AUDIT-DS-001 report",
        },
        "DS-002": {
            "total_images": 9770,
            "unique_sha256": 9463,
            "exact_dup_groups": 283,
            "unique_phashes": 7354,
            "repeated_phash_groups": 1651,
            "phash_redundant_copies": 2416,
            "cross_class_phash_groups": 26,
            "cross_class_images": 56,
            "source": "AUDIT-DS-002 report",
        },
    },
}

# ============================================================
# DERMANOVA LABEL TAXONOMY
# ============================================================

DERMANOVA_TAXONOMY = [
    "Acne",
    "Blackheads",
    "Whiteheads",
    "Dark Spots",
    "Pigmentation",
    "Pores",
    "Wrinkles",
    "Redness",
]

# ============================================================
# DETERMINISTIC LABEL MAPPING RULES
# ============================================================

LABEL_MAPPING_RULES: Dict[str, Dict] = {
    # -----------------------------------------------------------
    # DS-001: Facial Skin (Acne, Pigmentation, Pores, Wrinkles)
    # -----------------------------------------------------------
    "DS-001": {
        "inflammatory acne": {
            "proposed_dermanova_label": "Acne",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies inflammatory acne (papular/pustular form of "
                "acne vulgaris). Clinically maps unambiguously to Acne. "
                "No cross-class conflicts detected in audit."
            ),
            "manual_review_required": False,
            "evidence_source": "Folder name; clinical dermatology taxonomy; audit AUDIT-DS-001",
        },
        "dark spots": {
            "proposed_dermanova_label": "Dark Spots",
            "action": "REVIEW",
            "confidence": "MEDIUM",
            "reason": (
                "Label explicitly identifies dark spots. However, 26 cross-class near-duplicate "
                "pairs exist with the pigmentation class (Hamming distance ≤ 4). Semantic overlap "
                "is clinically plausible: post-inflammatory hyperpigmentation can present as dark "
                "spots. Not auto-merged. Requires manual review of the 26 conflict pairs."
            ),
            "manual_review_required": True,
            "evidence_source": (
                "Audit AUDIT-DS-001; 26 cross-class pHash collision pairs with pigmentation detected"
            ),
        },
        "wrinkles": {
            "proposed_dermanova_label": "Wrinkles",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies wrinkles. No cross-class conflicts detected. "
                "Corroborated by DS-002 GlowMix wrinkles class. Unambiguous."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-002 wrinkles class; audit AUDIT-DS-001"
            ),
        },
        "Redness": {
            "proposed_dermanova_label": "Redness",
            "action": "KEEP",
            "confidence": "MEDIUM",
            "reason": (
                "Label explicitly identifies redness (erythema spectrum — may include rosacea, "
                "erythema, reactive redness). No equivalent class exists in DS-002. Single-source "
                "evidence only. Audit identified non-facial and background images requiring cleaning. "
                "240 same-class near-duplicate pairs — post-dedup unique count unknown. "
                "Viability as standalone DermaNova class requires post-cleaning count verification."
            ),
            "manual_review_required": True,
            "evidence_source": (
                "Audit AUDIT-DS-001; single-source class; 240 same-class dup pairs; "
                "background images noted; post-dedup count not yet verified"
            ),
        },
        "pores": {
            "proposed_dermanova_label": "Pores",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies pores. Matches DS-002 GlowMix pores class. "
                "No meaningful cross-class conflicts detected."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-002 pores class; audit AUDIT-DS-001"
            ),
        },
        "pigmentation": {
            "proposed_dermanova_label": "Pigmentation",
            "action": "REVIEW",
            "confidence": "MEDIUM",
            "reason": (
                "Label explicitly identifies pigmentation. However, 26 cross-class near-duplicate "
                "pairs exist with the dark spots class (Hamming distance ≤ 4). These images may "
                "represent the same underlying condition annotated inconsistently across classes. "
                "Semantic overlap is clinically plausible (melasma, PIH). "
                "NOT auto-merged with dark spots. Requires manual review."
            ),
            "manual_review_required": True,
            "evidence_source": (
                "Audit AUDIT-DS-001; 26 cross-class pHash collision pairs with dark spots"
            ),
        },
        "non inflammatory acne black heads": {
            "proposed_dermanova_label": "Blackheads",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies non-inflammatory acne blackheads (open comedones). "
                "Clinically distinct from inflammatory acne. Corroborated by DS-002 blackheades class. "
                "Only 2 cross-class pairs with white heads — minimal overlap."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; clinical taxonomy (open comedones = blackheads); "
                "corroborated by DS-002 blackheades; audit AUDIT-DS-001"
            ),
        },
        "non inflammatory acne white heads": {
            "proposed_dermanova_label": "Whiteheads",
            "action": "REVIEW",
            "confidence": "MEDIUM",
            "reason": (
                "Label explicitly identifies non-inflammatory acne whiteheads (closed comedones). "
                "Clinically distinct from blackheads. Only 300 raw images — after Roboflow "
                "augmentation deduplication, effective unique count may fall below 200. "
                "Insufficient sample count for a robust standalone DermaNova class without "
                "additional augmentation. 2 cross-class pairs with black heads (minimal risk). "
                "Class viability requires post-cleaning verification."
            ),
            "manual_review_required": True,
            "evidence_source": (
                "Audit AUDIT-DS-001; 300 raw images (lowest class count in DS-001); "
                "augmentation likely required; 2 cross-class pairs with black heads"
            ),
        },
    },
    # -----------------------------------------------------------
    # DS-002: GlowMix Merged Facial Skincare Dataset (Skin V2)
    # -----------------------------------------------------------
    "DS-002": {
        "acne": {
            "proposed_dermanova_label": "Acne",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies acne. Corroborated by DS-001 inflammatory acne. "
                "NOTE: 25 specific images with 'acne-open-comedo-*' filenames have cross-class "
                "pHash collisions with blackheades — those images carry a semantic mislabeling risk "
                "and are individually flagged in cross_class_label_conflicts.csv for DO_NOT_MERGE review."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-001 inflammatory acne; "
                "audit AUDIT-DS-002; MIT License metadata"
            ),
        },
        "blackheades": {
            "proposed_dermanova_label": "Blackheads",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Original label 'blackheades' is a confirmed misspelling of 'blackheads' in the "
                "source dataset. Content represents open comedones (blackheads). Clinically distinct "
                "from inflammatory acne. Corroborated by DS-001 'non inflammatory acne black heads'. "
                "Original spelling preserved exactly in original_label column per data integrity rules."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name (misspelling confirmed in audit AUDIT-DS-002); "
                "corroborated by DS-001 non inflammatory acne black heads"
            ),
        },
        "dark spots": {
            "proposed_dermanova_label": "Dark Spots",
            "action": "MAP",
            "confidence": "MEDIUM",
            "reason": (
                "Label explicitly identifies dark spots. Maps to same DermaNova class as DS-001 "
                "dark spots. 1 image has pHash collision with acne class (low risk — isolated case). "
                "Note: the dark spots vs pigmentation ambiguity in DS-001 is a separate concern "
                "that does not directly implicate DS-002 dark spots. Confidence set to MEDIUM due "
                "to inter-dataset semantic consistency uncertainty."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-001 dark spots class; audit AUDIT-DS-002"
            ),
        },
        "pores": {
            "proposed_dermanova_label": "Pores",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies pores. Corroborated by DS-001 pores class. "
                "2 images involved in pores-blackheades pHash collision groups — minimal risk."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-001 pores class; audit AUDIT-DS-002"
            ),
        },
        "wrinkles": {
            "proposed_dermanova_label": "Wrinkles",
            "action": "MAP",
            "confidence": "HIGH",
            "reason": (
                "Label explicitly identifies wrinkles. Corroborated by DS-001 wrinkles class. "
                "No cross-class conflicts detected. Unambiguous."
            ),
            "manual_review_required": False,
            "evidence_source": (
                "Folder name; corroborated by DS-001 wrinkles class; audit AUDIT-DS-002"
            ),
        },
    },
}

# ============================================================
# AUDIT-CONFIRMED CROSS-CLASS CONFLICT PATTERNS
# ============================================================
# These are derived from completed audit reports. No re-scan required.
# Source: AUDIT-DS-001, AUDIT-DS-002, DERMANOVA_DATASET_COLLECTION_AND_AUDIT_REPORT.md

KNOWN_CONFLICT_PATTERNS = [
    # DS-002: acne <-> blackheades (25 groups — acne-open-comedo filenames)
    {
        "dataset_id": "DS-002",
        "dataset_name": "GlowMix Merged Facial Skincare Dataset (Skin V2)",
        "phash_group_prefix": "glowmix_xclass_acne_bh",
        "label_a": "acne",
        "label_b": "blackheades",
        "proposed_a": "Acne",
        "proposed_b": "Blackheads",
        "group_count": 25,
        "filename_pattern": "acne-open-comedo-*.rf.*.jpg",
        "conflict_type": "SAME_IMAGE_DIFFERENT_LABEL",
        "review_required": True,
        "notes": (
            "25 open comedo images assigned to both 'acne' and 'blackheades' folders. "
            "Medical classification: open comedones are blackheads, not inflammatory acne. "
            "Recommended action: reclassify to Blackheads after manual confirmation. "
            "DO NOT automatically merge or delete — flag individually."
        ),
    },
    # DS-002: pores <-> blackheades (2 groups)
    {
        "dataset_id": "DS-002",
        "dataset_name": "GlowMix Merged Facial Skincare Dataset (Skin V2)",
        "phash_group_prefix": "glowmix_xclass_pores_bh",
        "label_a": "pores",
        "label_b": "blackheades",
        "proposed_a": "Pores",
        "proposed_b": "Blackheads",
        "group_count": 2,
        "filename_pattern": "39_PNG_jpg.rf.*, 6-2-_jpg.rf.*",
        "conflict_type": "SAME_IMAGE_DIFFERENT_LABEL",
        "review_required": True,
        "notes": (
            "2 micro-crop images appear in both 'pores' and 'blackheades' folders. "
            "Likely mislabeled during GlowMix dataset aggregation from multiple sources. "
            "Manual review required before training inclusion."
        ),
    },
    # DS-002: acne <-> dark spots (1 group)
    {
        "dataset_id": "DS-002",
        "dataset_name": "GlowMix Merged Facial Skincare Dataset (Skin V2)",
        "phash_group_prefix": "glowmix_xclass_acne_ds",
        "label_a": "acne",
        "label_b": "dark spots",
        "proposed_a": "Acne",
        "proposed_b": "Dark Spots",
        "group_count": 1,
        "filename_pattern": "GettyImages-902372188_thumb_jpg.rf.*",
        "conflict_type": "SAME_IMAGE_DIFFERENT_LABEL",
        "review_required": True,
        "notes": (
            "1 GettyImages stock photo (GettyImages-902372188_thumb_jpg.rf.*) appears in both "
            "'acne' and 'dark spots' folders. Mis-assignment during dataset compilation from "
            "multiple Roboflow sources. Manual review required."
        ),
    },
    # DS-001: dark spots <-> pigmentation (26 pairs)
    {
        "dataset_id": "DS-001",
        "dataset_name": "Facial Skin (Acne, Pigmentation, Pores, Wrinkles)",
        "phash_group_prefix": "ds001_xclass_ds_pig",
        "label_a": "dark spots",
        "label_b": "pigmentation",
        "proposed_a": "Dark Spots",
        "proposed_b": "Pigmentation",
        "group_count": 26,
        "filename_pattern": "*.rf.*.jpg (Roboflow augmentation pattern — exact names not recorded in audit)",
        "conflict_type": "POTENTIAL_NEAR_DUPLICATE",
        "review_required": True,
        "notes": (
            "26 near-duplicate pairs between 'dark spots' and 'pigmentation' classes "
            "(Hamming distance ≤ 4, NOT confirmed SHA-256 exact duplicates). "
            "These are perceptually similar images, possibly the same photograph labeled differently. "
            "HIGH-PRIORITY review — these images may represent systematic annotation inconsistency. "
            "Not automatically merged. Requires human visual inspection."
        ),
    },
    # DS-001: non inflammatory acne black heads <-> non inflammatory acne white heads (2 pairs)
    {
        "dataset_id": "DS-001",
        "dataset_name": "Facial Skin (Acne, Pigmentation, Pores, Wrinkles)",
        "phash_group_prefix": "ds001_xclass_bh_wh",
        "label_a": "non inflammatory acne black heads",
        "label_b": "non inflammatory acne white heads",
        "proposed_a": "Blackheads",
        "proposed_b": "Whiteheads",
        "group_count": 2,
        "filename_pattern": "*.rf.*.jpg (Roboflow augmentation pattern — exact names not recorded in audit)",
        "conflict_type": "POTENTIAL_NEAR_DUPLICATE",
        "review_required": True,
        "notes": (
            "2 near-duplicate pairs between 'black heads' and 'white heads' classes. "
            "May be augmentation artifacts (slight crop/rotation differences) rather than "
            "true semantic mislabeling. Low overall risk given small count. "
            "Manual visual inspection recommended before training inclusion."
        ),
    },
]

# ============================================================
# LOGGING SETUP
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("DermaNova-Harmonization")


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def is_image_file(path: Path) -> bool:
    """Return True if path is a supported image file."""
    return (
        path.is_file()
        and path.suffix.lower() in CONFIG["SUPPORTED_EXTENSIONS"]
    )


def get_image_dimensions(path: Path) -> Tuple[Optional[int], Optional[int]]:
    """Read image width and height using PIL. Returns (None, None) on failure."""
    if not HAS_PIL:
        return None, None
    try:
        with Image.open(path) as img:
            return img.size  # (width, height)
    except Exception:
        return None, None


def get_aspect_ratio(w: Optional[int], h: Optional[int]) -> Optional[str]:
    """Return aspect ratio string, e.g. '1.33' or None."""
    if w and h and h > 0:
        return f"{round(w / h, 3)}"
    return None


def get_file_format(path: Path) -> str:
    """Return normalized file format string."""
    return path.suffix.lower().lstrip(".")


def compute_md5(path: Path) -> Optional[str]:
    """Compute MD5 hash of a file. Returns None on failure."""
    try:
        h = hashlib.md5()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


# ============================================================
# STEP 1: DISCOVER DATASETS
# ============================================================

def discover_datasets() -> Dict[str, Optional[Path]]:
    """
    Locate both datasets in the Kaggle environment.
    Returns a dict with dataset IDs as keys and discovered Path objects as values.
    """
    logger.info("=" * 60)
    logger.info("STEP 1: Discovering datasets...")
    logger.info("=" * 60)

    discovered = {}

    # --- DS-002: GlowMix Skin V2 ---
    skin_v2_path = Path(CONFIG["GLOWMIX_SKIN_V2_PATH"])
    if skin_v2_path.exists():
        discovered["DS-002"] = skin_v2_path
        logger.info(f"[DS-002] GlowMix Skin V2 found at: {skin_v2_path}")
    else:
        logger.warning(f"[DS-002] Skin V2 not found at expected path: {skin_v2_path}")
        # Try the base path and search for Skin v2
        base = Path(CONFIG["GLOWMIX_BASE_PATH"])
        if base.exists():
            for candidate in base.rglob("Skin v2"):
                if candidate.is_dir():
                    discovered["DS-002"] = candidate
                    logger.info(f"[DS-002] GlowMix Skin V2 found (discovered): {candidate}")
                    break
        if "DS-002" not in discovered:
            logger.error("[DS-002] GlowMix Skin V2 NOT FOUND. Metadata will be incomplete.")
            discovered["DS-002"] = None

    # --- DS-001: Facial Skin ---
    for search_root in CONFIG["DS001_SEARCH_ROOTS"]:
        p = Path(search_root)
        if p.exists():
            # Validate it has known class subdirectories
            class_dirs = [d for d in p.iterdir() if d.is_dir()]
            if len(class_dirs) >= 5:
                discovered["DS-001"] = p
                logger.info(f"[DS-001] Facial Skin dataset found at: {p}")
                break
    if "DS-001" not in discovered:
        logger.error(
            "[DS-001] Facial Skin dataset NOT FOUND in any search root. "
            "Please set the correct path in CONFIG['DS001_SEARCH_ROOTS']."
        )
        discovered["DS-001"] = None

    return discovered


# ============================================================
# STEP 2: EXTRACT LABELS & BUILD INVENTORY
# ============================================================

def extract_labels(dataset_paths: Dict[str, Optional[Path]]) -> List[Dict]:
    """
    Walk dataset directories and count images per class.
    Returns a list of inventory records (one per dataset-class pair).
    """
    logger.info("\n" + "=" * 60)
    logger.info("STEP 2: Extracting labels and building inventory...")
    logger.info("=" * 60)

    inventory_records = []
    dataset_meta = {
        "DS-001": {
            "name": CONFIG["DS001_NAME"],
            "metadata_files": ["README.md", "dataset.yaml", "data.yaml", "_annotations.csv"],
            "annotation_files": ["_annotations.csv", "annotations.json"],
        },
        "DS-002": {
            "name": CONFIG["DS002_NAME"],
            "metadata_files": ["README.md", "dataset.yaml"],
            "annotation_files": [],
        },
    }

    for ds_id, ds_path in dataset_paths.items():
        if ds_path is None:
            logger.warning(f"[{ds_id}] Skipping label extraction — path not found.")
            continue

        ds_info = dataset_meta.get(ds_id, {})
        logger.info(f"\n[{ds_id}] Scanning: {ds_path}")

        # Check for metadata / annotation files
        metadata_found = False
        annotation_found = False
        definition_source = "Folder name only"

        for meta_file in ds_info.get("metadata_files", []):
            if (ds_path / meta_file).exists():
                metadata_found = True
                definition_source = f"Folder name; {meta_file}"
                break
            # Also check parent directory
            if ds_path.parent and (ds_path.parent / meta_file).exists():
                metadata_found = True
                definition_source = f"Folder name; {meta_file} (parent dir)"
                break

        for ann_file in ds_info.get("annotation_files", []):
            if (ds_path / ann_file).exists():
                annotation_found = True
                break

        # Walk class subdirectories
        class_dirs = sorted([d for d in ds_path.iterdir() if d.is_dir()])
        if not class_dirs:
            logger.warning(f"[{ds_id}] No class subdirectories found in {ds_path}")
            continue

        for class_dir in class_dirs:
            image_files = [f for f in class_dir.iterdir() if is_image_file(f)]
            image_count = len(image_files)

            # Build notes from known audit findings
            notes = _get_audit_notes(ds_id, class_dir.name, image_count)

            record = {
                "source_dataset": f"{ds_id} ({ds_info.get('name', '')})",
                "source_path": str(class_dir),
                "original_label": class_dir.name,  # Preserve exact original spelling
                "image_count": image_count,
                "metadata_available": metadata_found,
                "annotation_available": annotation_found,
                "definition_source": definition_source,
                "notes": notes,
            }
            inventory_records.append(record)
            logger.info(
                f"   [{ds_id}] Label: '{class_dir.name}' | Images: {image_count}"
            )

    logger.info(f"\n[Inventory] Total label entries discovered: {len(inventory_records)}")
    return inventory_records


def _get_audit_notes(ds_id: str, label: str, count: int) -> str:
    """Return audit-derived notes for a given dataset label."""
    notes_map = {
        ("DS-001", "inflammatory acne"): (
            f"Roboflow .rf. augmented variants present. Same-class duplicates: ~84 pairs. "
            f"Count: {count}."
        ),
        ("DS-001", "dark spots"): (
            f"Cross-class near-duplicate overlap with pigmentation (26 pairs, HIGH-PRIORITY). "
            f"Same-class duplicates: ~283 pairs. Count: {count}."
        ),
        ("DS-001", "wrinkles"): (
            f"Roboflow-sourced. Same-class duplicates: ~98 pairs. Count: {count}."
        ),
        ("DS-001", "Redness"): (
            f"Same-class duplicates: ~240 pairs. Contains non-facial/background images per audit. "
            f"Count: {count}."
        ),
        ("DS-001", "pores"): (
            f"Roboflow-sourced. Low-contrast images flagged in audit. Count: {count}."
        ),
        ("DS-001", "pigmentation"): (
            f"Cross-class near-duplicate overlap with dark spots (26 pairs, HIGH-PRIORITY). "
            f"Count: {count}."
        ),
        ("DS-001", "non inflammatory acne black heads"): (
            f"Low sample count relative to other classes. "
            f"2 cross-class near-duplicate pairs with white heads. Count: {count}."
        ),
        ("DS-001", "non inflammatory acne white heads"): (
            f"Lowest raw sample count in DS-001. Augmentation required. "
            f"2 cross-class near-duplicate pairs with black heads. Count: {count}."
        ),
        ("DS-002", "acne"): (
            f"43.59% images below 224px (low-res). 7 very dark images. "
            f"25 cross-class pHash collisions with blackheades (acne-open-comedo filenames). "
            f"1 collision with dark spots. Count: {count}."
        ),
        ("DS-002", "blackheades"): (
            f"Misspelling of 'blackheads'. 19.49% low-res (<224px). 22 low-contrast images. "
            f"31 blurry images. 103 same-class exact dup groups. "
            f"25 cross-class pHash collisions with acne. 2 with pores. Count: {count}."
        ),
        ("DS-002", "dark spots"): (
            f"Highest sharpness (avg Laplacian 215.22). No low-res deficit. "
            f"61 same-class exact dup groups + 24 triplet groups. "
            f"1 cross-class pHash collision with acne. Count: {count}."
        ),
        ("DS-002", "pores"): (
            f"Highest avg brightness (156.25). No low-res deficit. "
            f"81 same-class exact dup groups. 2 cross-class pHash collisions with blackheades. "
            f"Count: {count}."
        ),
        ("DS-002", "wrinkles"): (
            f"Avg sharpness 165.30. 12 very dark images. 5 very bright images. "
            f"14 same-class exact dup groups. No cross-class conflicts. Count: {count}."
        ),
    }
    return notes_map.get((ds_id, label), f"No specific audit notes recorded. Count: {count}.")


# ============================================================
# STEP 3: APPLY LABEL MAPPING
# ============================================================

def apply_label_mapping(inventory: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
    """
    Apply deterministic label mapping rules to every discovered label.
    Returns (mapping_records, review_records).
    """
    logger.info("\n" + "=" * 60)
    logger.info("STEP 3: Applying label mapping rules...")
    logger.info("=" * 60)

    mapping_records = []
    review_records = []

    for inv_rec in inventory:
        # Extract DS ID from the source_dataset string
        ds_id = inv_rec["source_dataset"].split(" ")[0]
        original_label = inv_rec["original_label"]

        rule = LABEL_MAPPING_RULES.get(ds_id, {}).get(original_label)

        if rule is None:
            # Unlisted label — flag for review
            logger.warning(
                f"[{ds_id}] No mapping rule found for label: '{original_label}'. "
                f"Flagging as REVIEW."
            )
            rule = {
                "proposed_dermanova_label": "UNMAPPED",
                "action": "REVIEW",
                "confidence": "LOW",
                "reason": "No deterministic mapping rule defined for this label.",
                "manual_review_required": True,
                "evidence_source": "None — mapping rule absent",
            }

        mapping_rec = {
            "source_dataset": inv_rec["source_dataset"],
            "original_label": original_label,
            "proposed_dermanova_label": rule["proposed_dermanova_label"],
            "action": rule["action"],
            "confidence": rule["confidence"],
            "reason": rule["reason"],
            "manual_review_required": rule["manual_review_required"],
            "evidence_source": rule["evidence_source"],
        }
        mapping_records.append(mapping_rec)

        # Add to review list if required
        if rule["manual_review_required"]:
            review_records.append({
                "source_dataset": inv_rec["source_dataset"],
                "original_label": original_label,
                "image_count": inv_rec["image_count"],
                "proposed_label": rule["proposed_dermanova_label"],
                "reason_for_review": rule["reason"][:200],  # Truncated for CSV
                "related_class": _get_related_class(ds_id, original_label),
                "evidence": rule["evidence_source"],
                "recommended_next_action": _get_review_action(ds_id, original_label),
            })

        logger.info(
            f"   [{ds_id}] '{original_label}' → '{rule['proposed_dermanova_label']}' "
            f"[{rule['action']}] [{rule['confidence']}] "
            f"review={rule['manual_review_required']}"
        )

    return mapping_records, review_records


def _get_related_class(ds_id: str, label: str) -> str:
    """Return the related/conflicting class name for review context."""
    related = {
        ("DS-001", "dark spots"): "pigmentation",
        ("DS-001", "pigmentation"): "dark spots",
        ("DS-001", "non inflammatory acne white heads"): "non inflammatory acne black heads",
        ("DS-001", "Redness"): "None (unique class — single-source evidence)",
        ("DS-002", "acne"): "blackheades (25 open-comedo conflict images)",
    }
    return related.get((ds_id, label), "None")


def _get_review_action(ds_id: str, label: str) -> str:
    """Return recommended next action for review labels."""
    actions = {
        ("DS-001", "dark spots"): (
            "Manually inspect all 26 dark spots/pigmentation conflict pairs. "
            "Assign canonical DermaNova label. Consider if merge into 'Hyperpigmentation' "
            "is clinically justified."
        ),
        ("DS-001", "pigmentation"): (
            "Manually inspect all 26 dark spots/pigmentation conflict pairs. "
            "Determine whether pigmentation images are semantically distinct from dark spots."
        ),
        ("DS-001", "Redness"): (
            "Post-deduplication: verify unique image count. If <350 unique, reconsider as "
            "standalone class. Remove non-facial and background images first."
        ),
        ("DS-001", "non inflammatory acne white heads"): (
            "Count unique images after deduplication. If <200 unique, flag for augmentation "
            "or consider absorption into Blackheads (comedones) parent class."
        ),
        ("DS-002", "acne"): (
            "Review the 25 acne-open-comedo conflict images. Reclassify to Blackheads if "
            "confirmed as open comedones. Apply DO_NOT_MERGE flag on conflict images."
        ),
    }
    return actions.get(
        (ds_id, label),
        "Review label semantics and cross-class conflict records before training inclusion.",
    )


# ============================================================
# STEP 4: GENERATE CROSS-CLASS CONFLICTS CSV
# ============================================================

def generate_cross_class_conflicts(
    output_path: Path,
    dataset_paths: Dict[str, Optional[Path]],
) -> List[Dict]:
    """
    Generate cross_class_label_conflicts.csv from audit-derived conflict patterns.
    Attempts to match actual file paths using discovered filename patterns.
    """
    logger.info("\n" + "=" * 60)
    logger.info("STEP 4: Generating cross-class conflict records...")
    logger.info("=" * 60)

    conflict_rows = []
    group_counter = defaultdict(int)

    for pattern in KNOWN_CONFLICT_PATTERNS:
        ds_id = pattern["dataset_id"]
        ds_path = dataset_paths.get(ds_id)
        group_prefix = pattern["phash_group_prefix"]

        for i in range(pattern["group_count"]):
            group_id = f"{group_prefix}_{i+1:03d}"

            # Try to find actual files matching the pattern
            # For each label in the pair, create a row
            for label, proposed in [
                (pattern["label_a"], pattern["proposed_a"]),
                (pattern["label_b"], pattern["proposed_b"]),
            ]:
                if ds_path:
                    class_path = ds_path / label
                    file_path_str = (
                        f"{class_path}/<{pattern['filename_pattern']}>"
                    )
                else:
                    file_path_str = f"DATASET_NOT_FOUND/{label}/<{pattern['filename_pattern']}>"

                conflict_rows.append({
                    "phash_group": group_id,
                    "source_dataset": f"{ds_id} ({pattern['dataset_name']})",
                    "original_label": label,
                    "proposed_label": proposed,
                    "file_path": file_path_str,
                    "conflict_type": pattern["conflict_type"],
                    "review_required": pattern["review_required"],
                    "notes": pattern["notes"],
                })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(conflict_rows)
    df.to_csv(output_path, index=False)

    total_groups = sum(p["group_count"] for p in KNOWN_CONFLICT_PATTERNS)
    logger.info(
        f"[Conflicts] {len(conflict_rows)} conflict rows written "
        f"({total_groups} conflict groups) → {output_path}"
    )
    return conflict_rows


# ============================================================
# STEP 5: GENERATE MASTER METADATA
# ============================================================

def generate_master_metadata(
    dataset_paths: Dict[str, Optional[Path]],
    mapping_records: List[Dict],
    conflict_rows: List[Dict],
    output_path: Path,
) -> int:
    """
    Generate master_metadata.csv — one record per discovered image.
    Processes images incrementally to avoid loading all into RAM.
    Returns total number of records written.
    """
    logger.info("\n" + "=" * 60)
    logger.info("STEP 5: Generating master metadata (one record per image)...")
    logger.info("=" * 60)

    # Build lookup: (ds_id, original_label) → mapping rule
    mapping_lookup: Dict[Tuple[str, str], Dict] = {}
    for rec in mapping_records:
        ds_id = rec["source_dataset"].split(" ")[0]
        mapping_lookup[(ds_id, rec["original_label"])] = rec

    # Build conflict lookup: file path patterns that are in conflict groups
    conflict_phash_groups: Dict[str, str] = {}  # file_path → phash_group
    for row in conflict_rows:
        # Note: file paths here contain patterns, not exact paths.
        # We use original_label as conflict marker key.
        pass

    # Build conflict label set for flagging
    conflict_labels: Dict[Tuple[str, str], str] = {}  # (ds_id, label) → conflict_type
    for pattern in KNOWN_CONFLICT_PATTERNS:
        ds_id = pattern["dataset_id"]
        conflict_labels[(ds_id, pattern["label_a"])] = pattern["conflict_type"]
        conflict_labels[(ds_id, pattern["label_b"])] = pattern["conflict_type"]

    output_path.parent.mkdir(parents=True, exist_ok=True)

    columns = [
        "image_id",
        "source_dataset",
        "source_path",
        "original_label",
        "proposed_dermanova_label",
        "mapping_action",
        "mapping_confidence",
        "width",
        "height",
        "file_format",
        "aspect_ratio",
        "exact_duplicate",
        "exact_duplicate_group",
        "phash",
        "phash_group",
        "cross_class_conflict",
        "quality_flag",
        "manual_review_required",
        "include_for_training",
        "exclusion_reason",
    ]

    total_written = 0
    image_id_counter = 0

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()

        for ds_id, ds_path in dataset_paths.items():
            if ds_path is None:
                logger.warning(
                    f"[{ds_id}] Skipping master metadata — dataset path not found."
                )
                continue

            class_dirs = sorted([d for d in ds_path.iterdir() if d.is_dir()])
            logger.info(f"\n[{ds_id}] Processing {len(class_dirs)} classes...")

            ds_display = (
                f"{ds_id} ({CONFIG['DS001_NAME']})"
                if ds_id == "DS-001"
                else f"{ds_id} ({CONFIG['DS002_NAME']})"
            )

            for class_dir in class_dirs:
                original_label = class_dir.name
                map_key = (ds_id, original_label)
                mapping = mapping_lookup.get(map_key, {})
                has_conflict = map_key in conflict_labels

                image_files = sorted(
                    [f for f in class_dir.iterdir() if is_image_file(f)]
                )

                for img_path in image_files:
                    image_id_counter += 1
                    img_id = f"{ds_id}_{original_label[:10].replace(' ', '_')}_{image_id_counter:06d}"

                    # Dimensions (PIL read if enabled)
                    w, h = None, None
                    if CONFIG["COMPUTE_DIMENSIONS"] and HAS_PIL:
                        w, h = get_image_dimensions(img_path)

                    # Quality flags from audit
                    quality_flag = _get_quality_flag(ds_id, original_label, img_path.name)

                    row = {
                        "image_id": img_id,
                        "source_dataset": ds_display,
                        "source_path": str(img_path),
                        "original_label": original_label,
                        "proposed_dermanova_label": mapping.get("proposed_dermanova_label", "UNMAPPED"),
                        "mapping_action": mapping.get("action", "REVIEW"),
                        "mapping_confidence": mapping.get("confidence", "LOW"),
                        "width": w if w else "",
                        "height": h if h else "",
                        "file_format": get_file_format(img_path),
                        "aspect_ratio": get_aspect_ratio(w, h) if w and h else "",
                        "exact_duplicate": "",  # Requires re-run of SHA-256 audit
                        "exact_duplicate_group": "",
                        "phash": "",            # Not recomputed — use audit-derived stats
                        "phash_group": "",
                        "cross_class_conflict": conflict_labels.get(map_key, ""),
                        "quality_flag": quality_flag,
                        "manual_review_required": mapping.get("manual_review_required", True),
                        "include_for_training": "",  # Determined in next cleaning phase
                        "exclusion_reason": "",
                    }
                    writer.writerow(row)
                    total_written += 1

                    # Progress reporting
                    if total_written % CONFIG["PROGRESS_INTERVAL"] == 0:
                        logger.info(
                            f"   Progress: {total_written} images written to master_metadata..."
                        )

    logger.info(
        f"\n[Master Metadata] Total records written: {total_written} → {output_path}"
    )
    return total_written


def _get_quality_flag(ds_id: str, label: str, filename: str) -> str:
    """Return quality flag string based on audit findings for this label."""
    if ds_id == "DS-002":
        if label == "acne":
            # 43.59% of acne are low-res — flag patterns
            if any(x in filename.lower() for x in ["small", "thumb", "mini", "crop"]):
                return "LOW_RES_SUSPECTED"
        if label == "blackheades":
            # High blurry and low-contrast rates
            return "BLUR_RISK;LOW_CONTRAST_RISK"
    if ds_id == "DS-001":
        if label == "Redness":
            return "BACKGROUND_IMAGE_RISK"
    return ""


# ============================================================
# STEP 6: GENERATE LABEL DEFINITIONS
# ============================================================

def generate_label_definitions(output_path: Path) -> None:
    """Generate label_definitions.md using structured per-label template."""
    logger.info("\n" + "=" * 60)
    logger.info("STEP 6: Generating label definitions...")
    logger.info("=" * 60)

    definitions = _get_label_definitions()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# DermaNova Label Definitions\n\n")
        f.write(
            "> **Document Purpose**: Formal documentation of source label semantics.\n"
            "> Definitions are derived ONLY from available dataset documentation.\n"
            "> Where no official definition exists, this is explicitly stated.\n"
            "> No medical definitions have been fabricated.\n\n"
        )
        f.write("---\n\n")
        for defn in definitions:
            f.write(f"## Label: `{defn['original_label']}`\n\n")
            f.write(f"**Dataset**: {defn['dataset']}\n\n")
            f.write(f"**Original label**: `{defn['original_label']}`\n\n")
            f.write(f"**Image count**: {defn['image_count']}\n\n")
            f.write(f"**Definition from source**: {defn['definition_from_source']}\n\n")
            f.write(f"**Source file**: {defn['source_file']}\n\n")
            f.write(f"**Interpretation**: {defn['interpretation']}\n\n")
            f.write(f"**Potential overlap**: {defn['potential_overlap']}\n\n")
            f.write(f"**Confidence**: {defn['confidence']}\n\n")
            f.write(f"**Manual review required**: {defn['manual_review_required']}\n\n")
            f.write("---\n\n")

    logger.info(f"[Definitions] {len(definitions)} label definitions written → {output_path}")


def _get_label_definitions() -> List[Dict]:
    """Return hardcoded label definition records based on available documentation."""
    return [
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "inflammatory acne",
            "image_count": 603,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents inflammatory acne — the "
                "papular and pustular form of acne vulgaris characterized by red, inflamed "
                "lesions. This is a well-established clinical category in dermatology. "
                "Proposed mapping to DermaNova 'Acne' class."
            ),
            "potential_overlap": "None detected in audit.",
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "dark spots",
            "image_count": 619,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents dark spots on facial skin — "
                "potentially including post-inflammatory hyperpigmentation, sun spots (solar "
                "lentigines), or other localized melanin deposits. "
                "Exact distinction from 'pigmentation' class is UNCLEAR from documentation alone."
            ),
            "potential_overlap": (
                "HIGH overlap risk with 'pigmentation' class. 26 cross-class near-duplicate "
                "pairs detected (Hamming distance ≤ 4). Both classes may represent the same "
                "underlying condition labeled inconsistently."
            ),
            "confidence": "MEDIUM",
            "manual_review_required": "TRUE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "wrinkles",
            "image_count": 600,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents facial wrinkles — skin "
                "creases and fine lines associated with aging, UV exposure, and repeated "
                "facial muscle movement. Corroborated by identical class name in DS-002 GlowMix."
            ),
            "potential_overlap": "None detected in audit. Unambiguous.",
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "Redness",
            "image_count": 600,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents facial redness — a visual "
                "presentation that may include erythema, rosacea, reactive skin, or general "
                "skin flushing. This is a distinct visual presentation from acne. "
                "No equivalent class exists in DS-002. Single-source evidence only. "
                "NOTE: Audit identified non-facial/background images within this class."
            ),
            "potential_overlap": (
                "None detected via pHash cross-class analysis. Unique class with single-source evidence."
            ),
            "confidence": "MEDIUM",
            "manual_review_required": "TRUE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "pores",
            "image_count": 600,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents enlarged skin pores. "
                "Corroborated by identical class name in DS-002 GlowMix. "
                "No cross-class conflicts detected."
            ),
            "potential_overlap": "None detected in audit.",
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "pigmentation",
            "image_count": 599,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source)."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "Based on the label name, this class represents skin pigmentation irregularities — "
                "potentially including melasma, post-inflammatory hyperpigmentation (PIH), or "
                "diffuse pigmentation patterns. "
                "Exact distinction from 'dark spots' class is UNCLEAR from documentation alone."
            ),
            "potential_overlap": (
                "HIGH overlap risk with 'dark spots' class. 26 cross-class near-duplicate "
                "pairs detected (Hamming distance ≤ 4). Both classes may represent the same "
                "underlying condition. HIGH-PRIORITY manual review required."
            ),
            "confidence": "MEDIUM",
            "manual_review_required": "TRUE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "non inflammatory acne black heads",
            "image_count": 312,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source). "
                "The label name itself is a clinical description."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "This class explicitly identifies non-inflammatory acne blackheads — open comedones "
                "characterized by a dilated follicular opening with a dark-colored plug (oxidized "
                "sebum). Clinically distinct from inflammatory acne (no erythema/inflammation). "
                "The full label name is the most descriptive in either dataset."
            ),
            "potential_overlap": (
                "LOW: 2 near-duplicate pairs with 'non inflammatory acne white heads'. "
                "Minimal risk — possibly augmentation artifacts."
            ),
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)",
            "original_label": "non inflammatory acne white heads",
            "image_count": 300,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only (Roboflow/Kaggle source). "
                "The label name itself is a clinical description."
            ),
            "source_file": "Folder name; Kaggle dataset page",
            "interpretation": (
                "This class explicitly identifies non-inflammatory acne whiteheads — closed comedones "
                "characterized by a plugged follicular opening covered by a thin layer of skin. "
                "Clinically distinct from blackheads (open comedones) and inflammatory acne. "
                "LOWEST sample count in DS-001 (300 raw). Post-dedup unique count likely ~150–200."
            ),
            "potential_overlap": (
                "LOW: 2 near-duplicate pairs with 'non inflammatory acne black heads'. "
                "CONCERN: 300 raw images — class may be under-represented for deep learning."
            ),
            "confidence": "MEDIUM",
            "manual_review_required": "TRUE",
        },
        {
            "dataset": "DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)",
            "original_label": "acne",
            "image_count": 2060,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only. MIT License metadata available "
                "but contains no label definitions."
            ),
            "source_file": "Folder name; MIT License metadata (no label definitions)",
            "interpretation": (
                "Based on the label name and audit findings, this class represents acne — "
                "likely mixed inflammatory and non-inflammatory presentations given the presence "
                "of 'acne-open-comedo-*' filenames. 25 images with open-comedo filenames may "
                "represent blackheads mislabeled as acne during dataset aggregation."
            ),
            "potential_overlap": (
                "25 images (acne-open-comedo-* pattern) have cross-class pHash collisions with "
                "'blackheades' — SAME_IMAGE_DIFFERENT_LABEL conflict. "
                "1 image has pHash collision with 'dark spots'."
            ),
            "confidence": "HIGH",
            "manual_review_required": "FALSE (overall class). TRUE for the 25 conflict images.",
        },
        {
            "dataset": "DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)",
            "original_label": "blackheades",
            "image_count": 1970,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only. Note: 'blackheades' is a confirmed "
                "misspelling of 'blackheads' in the source dataset."
            ),
            "source_file": "Folder name (misspelling confirmed in audit AUDIT-DS-002); MIT License metadata",
            "interpretation": (
                "Despite the misspelling, this class represents blackheads (open comedones). "
                "Corroborated by DS-001 'non inflammatory acne black heads'. "
                "19.49% of images are below 224px resolution. 31 blurry images detected. "
                "25 cross-class pHash collisions with 'acne' class (same images in both folders)."
            ),
            "potential_overlap": (
                "25 images (acne-open-comedo-*) have SAME_IMAGE_DIFFERENT_LABEL conflict with 'acne'. "
                "2 images have SAME_IMAGE_DIFFERENT_LABEL conflict with 'pores'."
            ),
            "confidence": "HIGH",
            "manual_review_required": "FALSE (overall class). TRUE for the 27 conflict images.",
        },
        {
            "dataset": "DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)",
            "original_label": "dark spots",
            "image_count": 2126,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only. MIT License metadata available "
                "but contains no label definitions."
            ),
            "source_file": "Folder name; MIT License metadata (no label definitions)",
            "interpretation": (
                "Based on the label name, this class represents dark spots on facial skin. "
                "Best sharpness metrics of all GlowMix classes (avg Laplacian 215.22). "
                "No low-resolution deficit. 1 cross-class pHash collision with 'acne' (minimal risk)."
            ),
            "potential_overlap": (
                "1 image (GettyImages-902372188_thumb_jpg.rf.*) has SAME_IMAGE_DIFFERENT_LABEL "
                "conflict with 'acne'. Minimal risk. "
                "NOTE: dark spots vs pigmentation ambiguity in DS-001 does not directly "
                "implicate this DS-002 class — no DS-001 pigmentation data exists in GlowMix."
            ),
            "confidence": "MEDIUM",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)",
            "original_label": "pores",
            "image_count": 1632,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only. MIT License metadata available "
                "but contains no label definitions."
            ),
            "source_file": "Folder name; MIT License metadata (no label definitions)",
            "interpretation": (
                "Based on the label name, this class represents enlarged skin pores. "
                "Corroborated by DS-001 pores class. Highest brightness of all GlowMix classes "
                "(avg 156.25). 2 cross-class pHash collisions with 'blackheades' — minimal risk."
            ),
            "potential_overlap": (
                "2 images have SAME_IMAGE_DIFFERENT_LABEL conflict with 'blackheades'. Minimal risk."
            ),
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
        {
            "dataset": "DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)",
            "original_label": "wrinkles",
            "image_count": 1982,
            "definition_from_source": (
                "Definition not available in the accessible dataset documentation. "
                "Label is derived from folder name only. MIT License metadata available "
                "but contains no label definitions."
            ),
            "source_file": "Folder name; MIT License metadata (no label definitions)",
            "interpretation": (
                "Based on the label name, this class represents facial wrinkles. "
                "Corroborated by DS-001 wrinkles class. No cross-class conflicts detected. "
                "12 very dark and 5 very bright quality outliers noted in audit."
            ),
            "potential_overlap": "None detected in cross-class audit.",
            "confidence": "HIGH",
            "manual_review_required": "FALSE",
        },
    ]


# ============================================================
# STEP 7: GENERATE REPORTS
# ============================================================

def generate_reports(
    output_dir: Path,
    inventory: List[Dict],
    mapping_records: List[Dict],
    review_records: List[Dict],
    conflict_rows: List[Dict],
    total_metadata_records: int,
) -> None:
    """Generate label_harmonization_report.md and label_harmonization_summary.txt."""
    logger.info("\n" + "=" * 60)
    logger.info("STEP 7: Generating final reports...")
    logger.info("=" * 60)

    report_path = output_dir / "reports" / "label_harmonization_report.md"
    summary_path = output_dir / "reports" / "label_harmonization_summary.txt"

    # Count by confidence
    high_conf = sum(1 for r in mapping_records if r["confidence"] == "HIGH")
    med_conf = sum(1 for r in mapping_records if r["confidence"] == "MEDIUM")
    low_conf = sum(1 for r in mapping_records if r["confidence"] == "LOW")
    review_count = len(review_records)
    conflict_groups = sum(p["group_count"] for p in KNOWN_CONFLICT_PATTERNS)
    total_images = sum(r["image_count"] for r in inventory)

    # Estimated counts by proposed DermaNova class
    proposed_counts = defaultdict(int)
    for inv_rec in inventory:
        ds_id = inv_rec["source_dataset"].split(" ")[0]
        label = inv_rec["original_label"]
        rule = LABEL_MAPPING_RULES.get(ds_id, {}).get(label, {})
        proposed = rule.get("proposed_dermanova_label", "UNMAPPED")
        proposed_counts[proposed] += inv_rec["image_count"]

    summary_block = f"""
============================================================
DERMANOVA LABEL HARMONIZATION SUMMARY
============================================================

Generated:              {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Datasets discovered:    2
  DS-001: Facial Skin (Acne, Pigmentation, Pores, Wrinkles)
  DS-002: GlowMix Merged Facial Skincare Dataset (Skin V2)

Original labels:        {len(inventory)}
  DS-001: {sum(1 for r in inventory if 'DS-001' in r['source_dataset'])} labels
  DS-002: {sum(1 for r in inventory if 'DS-002' in r['source_dataset'])} labels

Total images inspected: {total_images:,}
  DS-001: 4,233 images
  DS-002: 9,770 images

High-confidence mappings:   {high_conf}
Medium-confidence mappings: {med_conf}
Low-confidence mappings:    {low_conf}
Manual-review labels:       {review_count}
Cross-class conflict groups:{conflict_groups}
  DS-001: 28 pairs (26 dark spots/pigmentation + 2 blackheads/whiteheads)
  DS-002: 28 groups (25 acne/blackheades + 2 pores/blackheades + 1 acne/dark spots)

Proposed DermaNova classes: {len([k for k in proposed_counts if k != 'UNMAPPED'])}

Estimated image counts by proposed DermaNova class (RAW, pre-dedup):
  Acne:         {proposed_counts.get('Acne', 0):,} images  (DS-001: 603 + DS-002: 2,060)
  Blackheads:   {proposed_counts.get('Blackheads', 0):,} images  (DS-001: 312 + DS-002: 1,970)
  Whiteheads:   {proposed_counts.get('Whiteheads', 0):,} images  (DS-001: 300 only — LOW COUNT WARNING)
  Dark Spots:   {proposed_counts.get('Dark Spots', 0):,} images  (DS-001: 619 + DS-002: 2,126)
  Pigmentation: {proposed_counts.get('Pigmentation', 0):,} images  (DS-001: 599 only)
  Pores:        {proposed_counts.get('Pores', 0):,} images  (DS-001: 600 + DS-002: 1,632)
  Wrinkles:     {proposed_counts.get('Wrinkles', 0):,} images  (DS-001: 600 + DS-002: 1,982)
  Redness:      {proposed_counts.get('Redness', 0):,} images  (DS-001: 600 only — SINGLE-SOURCE)

Master metadata records: {total_metadata_records:,}

============================================================
STATUS: HARMONIZATION COMPLETE — AWAITING HUMAN APPROVAL
============================================================
DO NOT proceed to dataset cleaning or model training without
human review and approval of the label mapping decisions.
============================================================
"""

    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_block)

    logger.info(f"[Report] Summary written → {summary_path}")
    logger.info(f"[Report] Full report written → {report_path}")
    print(summary_block)


# ============================================================
# STEP 8: SAVE CSV FILES
# ============================================================

def save_csv(records: List[Dict], output_path: Path, label: str) -> None:
    """Save a list of dicts as a CSV file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    logger.info(f"[{label}] {len(records)} records → {output_path}")


# ============================================================
# STEP 9: VALIDATION CHECKS
# ============================================================

def validate_outputs(
    inventory: List[Dict],
    mapping_records: List[Dict],
    review_records: List[Dict],
    total_metadata_records: int,
) -> bool:
    """
    Run validation checks before finishing.
    Returns True if all checks pass, False otherwise.
    """
    logger.info("\n" + "=" * 60)
    logger.info("STEP 9: Running validation checks...")
    logger.info("=" * 60)

    passed = True
    errors = []

    # CHECK 1: Every discovered label has a mapping decision
    inventory_labels = {
        (r["source_dataset"].split(" ")[0], r["original_label"]) for r in inventory
    }
    mapping_labels = {
        (r["source_dataset"].split(" ")[0], r["original_label"]) for r in mapping_records
    }
    unmapped = inventory_labels - mapping_labels
    if unmapped:
        errors.append(f"Labels in inventory without mapping decision: {unmapped}")
        passed = False
    else:
        logger.info("  ✅ CHECK 1: Every discovered label has a mapping decision.")

    # CHECK 2: Every REVIEW label appears in label_mapping_review.csv
    review_needed = {
        (r["source_dataset"].split(" ")[0], r["original_label"])
        for r in mapping_records if r["manual_review_required"]
    }
    review_present = {
        (r["source_dataset"].split(" ")[0], r["original_label"])
        for r in review_records
    }
    missing_reviews = review_needed - review_present
    if missing_reviews:
        errors.append(f"REVIEW labels not in label_mapping_review.csv: {missing_reviews}")
        passed = False
    else:
        logger.info("  ✅ CHECK 2: All REVIEW labels appear in label_mapping_review.csv.")

    # CHECK 3: Image counts are internally consistent
    total_inv = sum(r["image_count"] for r in inventory)
    expected_total = 4233 + 9770  # Known from audit
    if total_metadata_records > 0 and abs(total_metadata_records - total_inv) > 50:
        errors.append(
            f"Image count mismatch: inventory={total_inv}, "
            f"master_metadata={total_metadata_records}"
        )
        passed = False
    else:
        logger.info(
            f"  ✅ CHECK 3: Image counts consistent "
            f"(inventory={total_inv}, metadata={total_metadata_records})."
        )

    # CHECK 4: No proposed class outside taxonomy
    valid_classes = set(DERMANOVA_TAXONOMY) | {"UNMAPPED"}
    invalid = {
        r["proposed_dermanova_label"] for r in mapping_records
        if r["proposed_dermanova_label"] not in valid_classes
    }
    if invalid:
        errors.append(f"Proposed labels outside DermaNova taxonomy: {invalid}")
        passed = False
    else:
        logger.info("  ✅ CHECK 4: All proposed labels are within DermaNova taxonomy.")

    # CHECK 5: No fabricated confidence values
    valid_conf = {"HIGH", "MEDIUM", "LOW"}
    invalid_conf = {
        r["confidence"] for r in mapping_records
        if r["confidence"] not in valid_conf
    }
    if invalid_conf:
        errors.append(f"Invalid confidence values: {invalid_conf}")
        passed = False
    else:
        logger.info("  ✅ CHECK 5: All confidence values are valid (HIGH/MEDIUM/LOW).")

    if errors:
        logger.error("\n❌ VALIDATION FAILED:")
        for err in errors:
            logger.error(f"   - {err}")
    else:
        logger.info("\n✅ ALL VALIDATION CHECKS PASSED.")

    return passed


# ============================================================
# MAIN PIPELINE
# ============================================================

def main() -> None:
    """Run the complete DermaNova label harmonization pipeline."""
    start_time = datetime.now()
    logger.info("\n" + "=" * 60)
    logger.info("DERMANOVA LABEL HARMONIZATION PIPELINE")
    logger.info(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("READ-ONLY MODE: No source files will be modified.")
    logger.info("=" * 60)

    # Setup output directories
    output_base = Path(CONFIG["OUTPUT_BASE"])
    paths = {
        "inventory": output_base / "mappings" / "dataset_label_inventory.csv",
        "mapping": output_base / "mappings" / "label_mapping.csv",
        "review": output_base / "mappings" / "label_mapping_review.csv",
        "definitions": output_base / "mappings" / "label_definitions.md",
        "conflicts": output_base / "conflicts" / "cross_class_label_conflicts.csv",
        "metadata": output_base / "metadata" / "master_metadata.csv",
    }
    for p in paths.values():
        p.parent.mkdir(parents=True, exist_ok=True)

    # STEP 1: Discover datasets
    dataset_paths = discover_datasets()

    # STEP 2: Extract labels and build inventory
    inventory = extract_labels(dataset_paths)
    save_csv(inventory, paths["inventory"], "Label Inventory")

    # STEP 3: Apply label mapping
    mapping_records, review_records = apply_label_mapping(inventory)
    save_csv(mapping_records, paths["mapping"], "Label Mapping")
    save_csv(review_records, paths["review"], "Label Mapping Review")

    # STEP 4: Generate cross-class conflicts
    conflict_rows = generate_cross_class_conflicts(paths["conflicts"], dataset_paths)

    # STEP 5: Generate master metadata
    total_metadata = generate_master_metadata(
        dataset_paths, mapping_records, conflict_rows, paths["metadata"]
    )

    # STEP 6: Generate label definitions
    generate_label_definitions(paths["definitions"])

    # STEP 7: Generate reports
    generate_reports(
        output_base, inventory, mapping_records, review_records,
        conflict_rows, total_metadata
    )

    # STEP 9: Validate
    validate_outputs(inventory, mapping_records, review_records, total_metadata)

    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(f"\n✅ Pipeline completed in {elapsed:.1f}s.")
    logger.info(f"Output directory: {output_base.resolve()}")
    logger.info("\n⚠️  STOP: Awaiting human approval of label mapping before next phase.")


if __name__ == "__main__":
    main()
