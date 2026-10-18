"""
DermaNova Augmentation Technical Breakdown Visualizer (Forced Asymmetric Version)
==================================================================================
Generates a multi-panel visual breakdown image where every single augmentation
step (Flip, Rotate, Brightness, CLAHE, Noise, Whitehead Augmentation) is applied
to an asymmetric skin patch with 100% probability so visual changes are DRAMATIC and CLEAR.

Saves output PNG in datasets/dataset_audit/analysis_outputs/preprocessing_previews/augmentation_breakdown.png
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


def generate_dramatic_augmentation_breakdown():
    out_dir = Path("datasets/dataset_audit/analysis_outputs/preprocessing_previews")
    out_dir.mkdir(parents=True, exist_ok=True)

    h, w = 224, 224
    base_skin = np.ones((h, w, 3), dtype=np.uint8)
    base_skin[:, :] = [210, 155, 125]  # Natural skin tone RGB

    # Draw HIGHLY ASYMMETRIC features so flips & rotations are instantly obvious
    img_pil = Image.fromarray(base_skin)
    draw = ImageDraw.Draw(img_pil)

    # 1. Large RED Acne Papule on TOP LEFT only (x=45, y=55)
    draw.ellipse([25, 35, 65, 75], fill=(225, 35, 35))
    draw.ellipse([40, 50, 50, 60], fill=(255, 230, 210))  # Pustule center

    # 2. Group of DARK SPOTS on BOTTOM RIGHT only (x=160, y=160)
    for dx, dy in [(150, 150), (170, 160), (160, 180)]:
        draw.ellipse([dx, dy, dx+16, dy+16], fill=(90, 50, 35))

    # 3. Asymmetric Text Label "TOP LEFT ACNE" for absolute visual proof
    draw.rectangle([10, 190, 120, 215], fill=(40, 40, 40))
    draw.text((15, 195), "LEFT ACNE", fill=(255, 255, 255))

    base_np = np.array(img_pil)

    # Individual Forced Transformations (p=1.0)
    transformations = []

    # 1. Original
    transformations.append((
        "1. Original Input Crop",
        base_np,
        "Acne on TOP LEFT, Dark Spots BOTTOM RIGHT"
    ))

    # 2. Forced Horizontal Flip
    flip_tf = A.Compose([A.HorizontalFlip(p=1.0)])
    flip_np = flip_tf(image=base_np)["image"]
    transformations.append((
        "2. Horizontal Flip (Forced)",
        flip_np,
        "Acne moved to TOP RIGHT (Mirrored)"
    ))

    # 3. Forced Brightness & Contrast
    bright_tf = A.Compose([A.RandomBrightnessContrast(brightness_limit=(0.25, 0.25), contrast_limit=(0.25, 0.25), p=1.0)])
    bright_np = bright_tf(image=base_np)["image"]
    transformations.append((
        "3. High Brightness & Contrast",
        bright_np,
        "Simulates camera flash / daylight reflection"
    ))

    # 4. Forced Rotation & Scale
    rot_tf = A.Compose([A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.15, rotate_limit=(25, 25), p=1.0)])
    rot_np = rot_tf(image=base_np)["image"]
    transformations.append((
        "4. Shift Scale Rotate (25° Tilt)",
        rot_np,
        "Simulates camera tilt & user hand angle"
    ))

    # 5. Forced LAB CLAHE Equalization
    clahe_tf = A.Compose([A.CLAHE(clip_limit=(4.0, 4.0), tile_grid_size=(8, 8), p=1.0)])
    clahe_np = clahe_tf(image=base_np)["image"]
    transformations.append((
        "5. LAB CLAHE Equalization",
        clahe_np,
        "Sharpen pore micro-textures & spot borders"
    ))

    # 6. Forced Gaussian Sensor Noise
    noise_tf = A.Compose([A.GaussNoise(std_range=(0.2, 0.3), p=1.0)])
    noise_np = noise_tf(image=base_np)["image"]
    transformations.append((
        "6. Gaussian Sensor Noise",
        noise_np,
        "Simulates low-light smartphone camera grain"
    ))

    # 7. Targeted Combined Whiteheads Pipeline
    target_tf = A.Compose([
        A.HorizontalFlip(p=1.0),
        A.ShiftScaleRotate(shift_limit=0.08, scale_limit=0.1, rotate_limit=(20, 20), p=1.0),
        A.HueSaturationValue(hue_shift_limit=(15, 15), sat_shift_limit=(20, 20), val_shift_limit=(10, 10), p=1.0),
        A.CLAHE(clip_limit=(3.0, 3.0), p=1.0)
    ])
    target_np = target_tf(image=base_np)["image"]
    transformations.append((
        "7. Targeted Whiteheads Pipeline",
        target_np,
        "Combined heavy flip, rotate & hue shift"
    ))

    # Build High-Resolution Visual Grid (2 Rows x 4 Columns)
    cell_w, cell_h = 240, 290
    grid_w = cell_w * 4 + 30
    grid_h = cell_h * 2 + 60

    grid_img = Image.new("RGB", (grid_w, grid_h), color=(20, 20, 25))
    grid_draw = ImageDraw.Draw(grid_img)
    grid_draw.text((20, 15), "DermaNova Computer Vision Data Augmentation Breakdown (Forced Proof)", fill=(255, 215, 0))

    for idx, (title, img_data, desc) in enumerate(transformations):
        row = idx // 4
        col = idx % 4
        x0 = 20 + col * cell_w
        y0 = 50 + row * cell_h

        patch_pil = Image.fromarray(img_data).resize((220, 220))
        grid_img.paste(patch_pil, (x0, y0 + 25))

        grid_draw.text((x0, y0), title, fill=(100, 255, 100) if idx > 0 else (255, 255, 255))
        grid_draw.text((x0, y0 + 250), desc[:35], fill=(200, 200, 200))

    save_path = out_dir / "augmentation_breakdown.png"
    grid_img.save(save_path)
    print(f"[SUCCESS] Re-generated dramatic augmentation breakdown visualizer: {save_path.resolve()}")


if __name__ == "__main__":
    generate_dramatic_augmentation_breakdown()
