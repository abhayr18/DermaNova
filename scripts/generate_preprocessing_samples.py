"""
DermaNova Visual Preprocessing Sample Generator (Forced Visible Transforms)
===========================================================================
Generates side-by-side visual comparison preview PNG panels showing:
  Panel 1: Raw Input Crop (Low-res / un-enhanced)
  Panel 2: Bicubic Super-Resolution + LAB CLAHE Enhanced Image
  Panel 3: Augmented Training Patch (Forced p=1.0 Horizontal Flip + Rotation + Color Shift)

Saves PNG files in datasets/dataset_audit/analysis_outputs/preprocessing_previews/
"""

import os
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

import albumentations as A

from ml_pipeline.preprocessing.image_enhancement import ImageEnhancer
from ml_pipeline.preprocessing.face_alignment import FaceROIExtractor


def generate_dramatic_preprocessing_samples():
    out_dir = Path("datasets/dataset_audit/analysis_outputs/preprocessing_previews")
    out_dir.mkdir(parents=True, exist_ok=True)

    enhancer = ImageEnhancer(target_size=(224, 224))
    roi_extractor = FaceROIExtractor(output_size=(224, 224))

    # Forced Albumentations Augmenter for 100% Visible Demonstration in Preview PNGs
    demonstration_train_aug = A.Compose([
        A.HorizontalFlip(p=1.0),  # Forced Flip so lesion moves from LEFT to RIGHT
        A.ShiftScaleRotate(shift_limit=0.08, scale_limit=0.1, rotate_limit=(20, 20), p=1.0),  # Forced 20° tilt
        A.RandomBrightnessContrast(brightness_limit=(0.2, 0.2), contrast_limit=(0.2, 0.2), p=1.0),  # Forced Brightness
        A.HueSaturationValue(hue_shift_limit=(15, 15), sat_shift_limit=(20, 20), val_shift_limit=(10, 10), p=1.0)
    ])

    conditions = [
        ("Acne_LowRes_Crop", (100, 100), (195, 140, 110), "Acne"),
        ("Pores_CLAHE_Sharpen", (224, 224), (185, 145, 115), "Pores"),
        ("Whiteheads_Targeted_Aug", (224, 224), (205, 160, 130), "Whiteheads"),
        ("DarkSpots_Contrast", (224, 224), (175, 130, 100), "DarkSpots"),
    ]

    for name, raw_size, color_base, lesion_type in conditions:
        # Create ASYMMETRIC raw image (Red Acne/Spot strictly on TOP LEFT)
        raw_pil = Image.new("RGB", raw_size, color=color_base)
        draw = ImageDraw.Draw(raw_pil)

        # Draw RED ACNE / LESION strictly on TOP LEFT (x=20%, y=25%)
        lx = int(raw_size[0] * 0.25)
        ly = int(raw_size[1] * 0.25)
        lr = max(6, int(raw_size[0] * 0.12))

        if lesion_type == "Acne":
            draw.ellipse([lx-lr, ly-lr, lx+lr, ly+lr], fill=(225, 35, 35))
            draw.ellipse([lx-lr//3, ly-lr//3, lx+lr//3, ly+lr//3], fill=(255, 230, 210))
        elif lesion_type == "DarkSpots":
            draw.ellipse([lx-lr, ly-lr, lx+lr, ly+lr], fill=(70, 40, 30))
        elif lesion_type == "Whiteheads":
            draw.ellipse([lx-lr, ly-lr, lx+lr, ly+lr], fill=(245, 240, 210))
        else:  # Pores
            for px in range(15, 60, 10):
                for py in range(15, 60, 10):
                    draw.ellipse([px, py, px+4, py+4], fill=(120, 80, 60))

        # Draw a small Dark Mole on BOTTOM RIGHT for double asymmetry proof
        bx = int(raw_size[0] * 0.75)
        by = int(raw_size[1] * 0.75)
        br = max(4, int(raw_size[0] * 0.06))
        draw.ellipse([bx-br, by-br, bx+br, by+br], fill=(40, 30, 25))

        # 1. ROI Extract
        roi_pil = roi_extractor.process(raw_pil)

        # 2. Bicubic Super-Res + LAB CLAHE
        enhanced_np = enhancer.preprocess_image(roi_pil)
        enhanced_pil = Image.fromarray(enhanced_np)

        # 3. Augmented Training Patch (Forced p=1.0 transforms)
        aug_out = demonstration_train_aug(image=enhanced_np)
        aug_np = aug_out["image"]
        aug_pil = Image.fromarray(aug_np)

        # 4. Build Side-by-Side Panel (Original | Bicubic+CLAHE | Augmented)
        panel_w = 224 * 3 + 40
        panel_h = 224 + 55
        panel = Image.new("RGB", (panel_w, panel_h), color=(20, 20, 25))

        # Raw display scaled to 224x224
        raw_disp = raw_pil.resize((224, 224), resample=Image.Resampling.NEAREST)

        panel.paste(raw_disp, (10, 45))
        panel.paste(enhanced_pil, (234, 45))
        panel.paste(aug_pil, (458, 45))

        p_draw = ImageDraw.Draw(panel)
        p_draw.text((10, 12), f"1. Raw ({raw_size[0]}x{raw_size[1]} px)", fill=(255, 255, 255))
        p_draw.text((10, 28), "Lesion on TOP LEFT", fill=(200, 200, 200))

        p_draw.text((234, 12), "2. Bicubic + LAB CLAHE", fill=(100, 255, 100))
        p_draw.text((234, 28), "Sharpened Pore/Edge Contrast", fill=(150, 255, 150))

        p_draw.text((458, 12), "3. Augmented Patch (FLIPPED & ROTATED)", fill=(255, 215, 0))
        p_draw.text((458, 28), "Lesion Flipped to TOP RIGHT + 20° Tilt", fill=(255, 235, 150))

        save_path = out_dir / f"sample_{name}.png"
        panel.save(save_path)
        print(f"Re-generated dramatic sample preview: {save_path}")

    print(f"\n[SUCCESS] Re-generated 4 dramatic visual sample previews in: {out_dir.resolve()}")


if __name__ == "__main__":
    generate_dramatic_preprocessing_samples()
