"""
DermaNova Preprocessing Unit Tests
===================================
Tests CLAHE contrast enhancement, Bicubic low-resolution upscaling,
face ROI extraction, and Albumentations/PyTorch data augmentation.
"""

import numpy as np
from PIL import Image

from ml_pipeline.preprocessing.image_enhancement import ImageEnhancer
from ml_pipeline.preprocessing.face_alignment import FaceROIExtractor
from ml_pipeline.preprocessing.augmentation import DermaNovaAugmenter


def test_image_enhancer_low_res():
    enhancer = ImageEnhancer(target_size=(224, 224))
    
    # Create low-resolution dummy image (100 x 100)
    low_res_img = Image.new("RGB", (100, 100), color=(120, 80, 50))
    
    # Process
    processed_np = enhancer.preprocess_image(low_res_img)
    
    assert processed_np.shape == (224, 224, 3), f"Expected shape (224, 224, 3), got {processed_np.shape}"
    print("[PASS] ImageEnhancer low-resolution Bicubic upscaling + CLAHE test passed!")


def test_face_roi_extractor():
    extractor = FaceROIExtractor(output_size=(224, 224), margin_ratio=0.1)
    
    dummy_img = Image.new("RGB", (500, 500), color=(200, 150, 100))
    cropped = extractor.process(dummy_img)
    
    assert cropped.size == (224, 224), f"Expected size (224, 224), got {cropped.size}"
    print("[PASS] FaceROIExtractor central crop alignment test passed!")


def test_augmentation_pipeline():
    augmenter = DermaNovaAugmenter(image_size=(224, 224))
    dummy_np = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Train transform
    res_train = augmenter.augment(dummy_np, is_train=True)
    assert "image" in res_train, "Augmentation result must contain 'image' key"
    
    # Targeted Whiteheads transform
    res_whitehead = augmenter.augment(dummy_np, is_train=True, is_whitehead=True)
    assert "image" in res_whitehead, "Whitehead augmentation result must contain 'image' key"

    # Validation transform
    res_val = augmenter.augment(dummy_np, is_train=False)
    assert "image" in res_val, "Validation result must contain 'image' key"

    print("[PASS] DermaNovaAugmenter train, validation, and targeted Whiteheads tests passed!")


if __name__ == "__main__":
    print("============================================================")
    print("DERMANOVA PREPROCESSING UNIT TEST SUITE")
    print("============================================================")
    test_image_enhancer_low_res()
    test_face_roi_extractor()
    test_augmentation_pipeline()
    print("\n[SUCCESS] All preprocessing unit tests passed successfully!")
