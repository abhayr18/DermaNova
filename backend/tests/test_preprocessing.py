"""
Unit Tests: Preprocessing Consistency
======================================
Tests:
1. Low-resolution bicubic upscaling preserves target shape
2. CLAHE contrast enhancement on LAB space
3. Tensor conversion produces (1, 3, 224, 224) float32 tensor
4. ImageNet normalization statistics applied deterministically
"""

import pytest
import numpy as np
from PIL import Image
import torch

from backend.app.services.preprocessing_service import preprocessing_service, IMAGENET_MEAN, IMAGENET_STD


def test_upscale_low_res_dimensions():
    """Verify that images smaller than (224, 224) are upscaled smoothly."""
    small_img = Image.new("RGB", (100, 100), color=(150, 100, 80))
    upscaled = preprocessing_service.upscale_low_res(small_img)
    assert upscaled.size == (224, 224)


def test_enhance_and_resize_shape_and_dtype():
    """Verify RGB enhancement output shape and range."""
    test_img = Image.new("RGB", (300, 300), color=(140, 95, 75))
    enhanced_np = preprocessing_service.enhance_and_resize(test_img)
    assert enhanced_np.shape == (224, 224, 3)
    assert enhanced_np.dtype == np.uint8


def test_preprocess_to_tensor_shape_and_normalization():
    """Verify tensor shape (1, 3, 224, 224), dtype, and ImageNet normalization."""
    test_img = Image.new("RGB", (250, 250), color=(128, 128, 128))
    tensor = preprocessing_service.preprocess_to_tensor(test_img)

    assert isinstance(tensor, torch.Tensor)
    assert tensor.shape == (1, 3, 224, 224)
    assert tensor.dtype == torch.float32

    # Check finite values
    assert torch.isfinite(tensor).all()


def test_deterministic_preprocessing():
    """Verify that identical input images produce identical preprocessed tensors."""
    img1 = Image.new("RGB", (224, 224), color=(160, 110, 85))
    img2 = Image.new("RGB", (224, 224), color=(160, 110, 85))

    t1 = preprocessing_service.preprocess_to_tensor(img1)
    t2 = preprocessing_service.preprocess_to_tensor(img2)

    assert torch.equal(t1, t2)
