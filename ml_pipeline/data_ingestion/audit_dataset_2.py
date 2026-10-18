"""
DermaNova Dataset Audit & Quality Analysis Script (Dataset #2)
Performs:
1. Class distribution & image count breakdown
2. Image resolution & aspect ratio distribution
3. MD5 exact duplicate detection
4. ImageHash perceptual duplicate detection
5. Blur detection (Laplacian variance) & artifact quality check
6. Exportable CSV audit log & summary metrics
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
from PIL import Image, ImageStat
import hashlib

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

try:
    import imagehash
    HAS_IMAGEHASH = True
except ImportError:
    HAS_IMAGEHASH = False


def calculate_blur_score(img_path: str) -> float:
    """Calculate blur variance score using OpenCV Laplacian operator."""
    if not HAS_OPENCV:
        return -1.0
    try:
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0
        return cv2.Laplacian(img, cv2.CV_64F).var()
    except Exception:
        return 0.0


def audit_dataset_directory(dataset_path: str, output_csv: str = None) -> pd.DataFrame:
    dataset_dir = Path(dataset_path)
    if not dataset_dir.exists():
        print(f"❌ Error: Dataset directory '{dataset_path}' not found.")
        print(f"👉 Please place raw dataset #2 in: datasets/raw/<dataset_name>")
        return pd.DataFrame()

    print(f"🔍 Starting Dataset Audit for: {dataset_dir.name}...")
    records = []
    
    for class_dir in dataset_dir.iterdir():
        if not class_dir.is_dir():
            continue
        
        print(f"   📁 Scanning class: {class_dir.name}...")
        for img_path in class_dir.glob("*"):
            if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
                continue

            try:
                # Basic PIL inspection
                with Image.open(img_path) as img:
                    width, height = img.size
                    mode = img.mode

                # Hashing
                with open(img_path, "rb") as f:
                    md5_hash = hashlib.md5(f.read()).hexdigest()

                phash = str(imagehash.dhash(Image.open(img_path))) if HAS_IMAGEHASH else ""
                blur_score = calculate_blur_score(str(img_path))

                records.append({
                    "dataset": dataset_dir.name,
                    "class": class_dir.name,
                    "filename": img_path.name,
                    "path": str(img_path),
                    "width": width,
                    "height": height,
                    "aspect_ratio": round(width / height, 3),
                    "mode": mode,
                    "md5": md5_hash,
                    "phash": phash,
                    "blur_score": round(blur_score, 2),
                    "is_blurry": blur_score < 100.0 if blur_score >= 0 else False
                })
            except Exception as e:
                print(f"   ⚠️ Warning: Failed to process {img_path.name}: {e}")

    df = pd.DataFrame(records)
    if df.empty:
        print("⚠️ No valid images found in directory structure.")
        return df

    print("\n" + "="*50)
    print(f"📊 AUDIT RESULTS SUMMARY FOR: {dataset_dir.name}")
    print("="*50)
    print(f"Total Images Analyzed: {len(df)}")
    print(f"Unique MD5 Hashes: {df['md5'].nunique()} (Duplicates: {len(df) - df['md5'].nunique()})")
    if HAS_IMAGEHASH:
        print(f"Unique Perceptual Hashes: {df['phash'].nunique()}")
    print(f"Blurry Images (<100 laplacian var): {df['is_blurry'].sum()}")

    print("\nClass Distribution:")
    print(df["class"].value_counts())

    print("\nResolution Statistics (Width x Height):")
    print(df[["width", "height", "blur_score"]].describe())

    if output_csv:
        out_p = Path(output_csv)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_p, index=False)
        print(f"\n✅ Audit metadata exported to: {output_csv}")

    return df


if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "datasets/raw/dataset_02"
    output_report = "datasets/dataset_audit/reports/dataset_02_audit.csv"
    audit_dataset_directory(target_dir, output_report)
