"""Run and save every current DermaNova preprocessing stage on one image.

Usage:
    python -m scripts.walkthrough_preprocessing sample_images/my_photo.jpg
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

from ml_pipeline.preprocessing.augmentation import DermaNovaAugmenter, HAS_ALBUMENTATIONS
from ml_pipeline.preprocessing.face_alignment import FaceROIExtractor
from ml_pipeline.preprocessing.image_enhancement import ImageEnhancer


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PREVIEW_PATH = (
    PROJECT_ROOT
    / "datasets/dataset_audit/analysis_outputs/preprocessing_previews"
    / "sample_Acne_LowRes_Crop.png"
)
OUTPUT_DIR = PROJECT_ROOT / "preprocessing_walkthrough_output"


def get_input_image_path() -> Path:
    """Use a supplied image path, or fall back to the generated project preview."""
    parser = argparse.ArgumentParser(
        description="Save each DermaNova preprocessing stage for one image."
    )
    parser.add_argument(
        "image_path",
        nargs="?",
        type=Path,
        help="Path to a JPEG/PNG/WebP image, relative to the project root or absolute.",
    )
    args = parser.parse_args()

    if args.image_path is None:
        return PREVIEW_PATH

    supplied_path = args.image_path
    input_path = supplied_path if supplied_path.is_absolute() else PROJECT_ROOT / supplied_path
    if not input_path.is_file():
        parser.error(f"Image not found: {input_path}")
    return input_path


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    input_path = get_input_image_path()
    print(f"Albumentations available: {HAS_ALBUMENTATIONS}")
    input_image = Image.open(input_path).convert("RGB")

    # The fallback file is a three-panel project preview. Extract its first
    # 224x224 panel; all user-supplied files are used unchanged.
    if input_path == PREVIEW_PATH:
        original = input_image.crop((10, 40, 234, 264))
    else:
        original = input_image

    print(f"Input image: {input_path}")
    original.save(OUTPUT_DIR / "01_original.png")
    print(f"1. Original: size={original.size}, mode={original.mode}")

    extractor = FaceROIExtractor(output_size=(224, 224), margin_ratio=0.10)
    roi = extractor.process(original)
    roi.save(OUTPUT_DIR / "02_roi_crop.png")
    print(f"2. ROI crop: size={roi.size}")

    enhancer = ImageEnhancer(target_size=(224, 224))
    enhanced_np = enhancer.preprocess_image(roi)
    Image.fromarray(enhanced_np).save(OUTPUT_DIR / "03_clahe_enhanced.png")
    print(
        "3. CLAHE output: "
        f"shape={enhanced_np.shape}, dtype={enhanced_np.dtype}, "
        f"pixel_range=[{enhanced_np.min()}, {enhanced_np.max()}]"
    )

    augmenter = DermaNovaAugmenter(image_size=(224, 224))
    augmented = augmenter.augment(enhanced_np, is_train=True, is_whitehead=False)["image"]
    augmented_np = augmented.numpy() if hasattr(augmented, "numpy") else augmented
    print(
        "4. Normalized tensor: "
        f"shape={tuple(augmented_np.shape)}, dtype={augmented_np.dtype}, "
        f"range=[{augmented_np.min():.3f}, {augmented_np.max():.3f}]"
    )

    # Invert ImageNet normalization purely for human visual inspection.
    image_hwc = np.transpose(augmented_np, (1, 2, 0))
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    visible = np.clip((image_hwc * std + mean) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(visible).save(OUTPUT_DIR / "04_augmented_visible.png")

    print(f"\nSaved four stages to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
