"""
DermaNova Sample Annotations Generator
======================================
Generates representative CSV annotation files in datasets/annotations/
for local inspection, modeling tests, and UI integration prior to full Kaggle execution.
"""

import os
from pathlib import Path
import pandas as pd
import numpy as np

DERMANOVA_CLASSES = [
    "Acne", "Blackheads", "Whiteheads", "Dark_Spots",
    "Pigmentation", "Pores", "Wrinkles", "Redness"
]

def generate_sample_splits():
    out_dir = Path("datasets/annotations")
    out_dir.mkdir(parents=True, exist_ok=True)

    np.random.seed(42)

    # Class sample distributions matching our ground truth counts
    class_counts = {
        "Acne": 2638,
        "Blackheads": 2307,
        "Whiteheads": 300,
        "Dark_Spots": 2745,
        "Pigmentation": 599,
        "Pores": 2232,
        "Wrinkles": 2582,
        "Redness": 600,
    }

    records = []
    img_counter = 0

    for cls_name, count in class_counts.items():
        for i in range(count):
            img_counter += 1
            ds_id = "DS-001" if cls_name in ["Whiteheads", "Pigmentation", "Redness"] or (i % 2 == 0 and cls_name not in ["Blackheads"]) else "DS-002"
            
            base_fn = f"{cls_name.lower()}_sample_{i:04d}"
            fn = f"{base_fn}.rf.hash{i:04d}.jpg" if ds_id == "DS-001" else f"{base_fn}.jpg"
            path_str = f"/kaggle/input/{'facial-skin-acne-pigmentation-pores-wrinkles' if ds_id == 'DS-001' else 'glowmix-merged-facial-skincare-dataset'}/{cls_name}/{fn}"

            row = {
                "dataset_id": ds_id,
                "source_path": path_str,
                "filename": fn,
                "base_filename": base_fn,
                "original_label": cls_name.lower(),
                "width": 224 if ds_id == "DS-002" and i % 5 == 0 else 512,
                "height": 224 if ds_id == "DS-002" and i % 5 == 0 else 512,
                "aspect_ratio": 1.0,
                "md5": f"md5_{img_counter:06d}",
                "phash": f"phash_{img_counter:06d}",
                "group_key": base_fn,
            }

            # Set multi-label vectors
            for c in DERMANOVA_CLASSES:
                row[f"label_{c}"] = 1 if c == cls_name else 0

            # Apply Dark Spots / Pigmentation overlap for first 26 samples of Pigmentation
            if cls_name == "Pigmentation" and i < 26:
                row["label_Dark_Spots"] = 1

            records.append(row)

    df_all = pd.DataFrame(records)

    # 70 / 15 / 15 Stratified Group Split
    shuffled_groups = df_all["group_key"].unique()
    np.random.shuffle(shuffled_groups)

    n_total = len(shuffled_groups)
    n_train = int(n_total * 0.70)
    n_val = int(n_total * 0.15)

    train_groups = set(shuffled_groups[:n_train])
    val_groups = set(shuffled_groups[n_train:n_train + n_val])
    test_groups = set(shuffled_groups[n_train + n_val:])

    train_df = df_all[df_all["group_key"].isin(train_groups)].copy().reset_index(drop=True)
    val_df = df_all[df_all["group_key"].isin(val_groups)].copy().reset_index(drop=True)
    test_df = df_all[df_all["group_key"].isin(test_groups)].copy().reset_index(drop=True)

    train_df["split"] = "train"
    val_df["split"] = "val"
    test_df["split"] = "test"

    master_df = pd.concat([train_df, val_df, test_df], ignore_index=True)

    master_df.to_csv(out_dir / "dermanova_master_clean.csv", index=False)
    train_df.to_csv(out_dir / "dermanova_train_split.csv", index=False)
    val_df.to_csv(out_dir / "dermanova_val_split.csv", index=False)
    test_df.to_csv(out_dir / "dermanova_test_split.csv", index=False)

    print(f"Generated {len(master_df)} rows in {out_dir.resolve()}:")
    print(f"  - dermanova_master_clean.csv ({len(master_df)} rows)")
    print(f"  - dermanova_train_split.csv  ({len(train_df)} rows)")
    print(f"  - dermanova_val_split.csv    ({len(val_df)} rows)")
    print(f"  - dermanova_test_split.csv   ({len(test_df)} rows)")

if __name__ == "__main__":
    generate_sample_splits()
