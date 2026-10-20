"""
Unit Tests: Image Validation & Optical Quality Gatekeeper
==========================================================
Verifies:
1. Valid JPEG, PNG, and WebP format decoding
2. Magic bytes inspection and rejection of invalid formats
3. Empty image and corrupted file rejection
4. Maximum upload size restriction (> 5MB)
5. Blank white and completely dark image rejections
6. Missing face / non-skin region rejection
"""

import io
import pytest
import numpy as np
from PIL import Image

from backend.app.services.image_validation_service import image_validation_service
from backend.app.services.image_quality_service import image_quality_service
from backend.app.core.exceptions import ImageValidationError, ImageTooLargeError, ImageQualityError


def test_valid_jpeg_png_webp_formats():
    """Verify that genuine JPEG, PNG, and WebP buffers pass validation and decode."""
    for fmt in ["JPEG", "PNG", "WEBP"]:
        buf = io.BytesIO()
        img = Image.new("RGB", (200, 200), color=(180, 120, 90))
        img.save(buf, format=fmt)
        clean_img, raw_bytes = image_validation_service.validate_and_decode(buf.getvalue())
        assert clean_img.size == (200, 200)
        assert len(raw_bytes) > 0


def test_unsupported_format_rejected():
    """Verify that non-image payloads fail with ImageValidationError."""
    with pytest.raises(ImageValidationError) as exc:
        image_validation_service.validate_and_decode(b"This is just a text file pretending to be an image.")
    assert "Unsupported file format" in str(exc.value)


def test_empty_upload_rejected():
    """Verify that empty payloads fail validation."""
    with pytest.raises(ImageValidationError) as exc:
        image_validation_service.validate_and_decode(b"")
    assert "empty or corrupted" in str(exc.value)


def test_corrupted_image_rejected():
    """Verify that truncated or malformed image data is safely rejected."""
    corrupted_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 40
    with pytest.raises(ImageValidationError) as exc:
        image_validation_service.validate_and_decode(corrupted_jpeg)
    assert "corrupted or unreadable" in str(exc.value)


def test_oversized_upload_rejected():
    """Verify that uploads exceeding 5MB are rejected with ImageTooLargeError."""
    # 5.5 MB dummy byte buffer with JPEG magic header
    oversized = b"\xff\xd8\xff" + b"\x00" * (6 * 1024 * 1024)
    with pytest.raises(ImageTooLargeError) as exc:
        image_validation_service.validate_and_decode(oversized)
    assert "exceeds the maximum limit" in str(exc.value)


def test_blank_white_canvas_rejected_by_quality_gate():
    """Blank white canvas must be rejected as clinically unsuitable."""
    white_img = Image.new("RGB", (224, 224), color=(255, 255, 255))
    with pytest.raises(ImageQualityError) as exc:
        image_quality_service.evaluate_quality_and_suitability(white_img)
    assert "blank" in str(exc.value).lower() or "washed out" in str(exc.value).lower()


def test_pitch_black_canvas_rejected_by_quality_gate():
    """Completely dark image must be rejected as underexposed."""
    black_img = Image.new("RGB", (224, 224), color=(0, 0, 0))
    with pytest.raises(ImageQualityError) as exc:
        image_quality_service.evaluate_quality_and_suitability(black_img)
    assert "dark" in str(exc.value).lower() or "underexposed" in str(exc.value).lower()


def test_non_human_skin_image_rejected():
    """Image with no human skin chrominance (e.g. solid neon green) must be rejected."""
    neon_green = Image.new("RGB", (224, 224), color=(0, 255, 0))
    with pytest.raises(ImageQualityError) as exc:
        image_quality_service.evaluate_quality_and_suitability(neon_green)
    assert "No human face" in str(exc.value) or "texture" in str(exc.value).lower()
