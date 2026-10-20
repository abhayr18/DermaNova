"""
DermaNova Image Validation & Security Service
==============================================
Enforces strict security checks on uploaded files:
1. File size enforcement (<= MAX_UPLOAD_SIZE_BYTES)
2. File signature / Magic bytes inspection (JPEG, PNG, WebP)
3. Decompression bomb protection (PIL MAX_IMAGE_PIXELS)
4. Corrupted file & malformed payload rejection
5. Image dimensions & pixel-count bounding
"""

import io
import base64
import logging
from typing import Tuple, Optional, Union
from PIL import Image, ImageOps

from backend.app.core.config import settings
from backend.app.core.exceptions import ImageValidationError, ImageTooLargeError

logger = logging.getLogger("dermanova.services.image_validation")

# Enforce decompression bomb defense
Image.MAX_IMAGE_PIXELS = settings.MAX_PIXEL_COUNT

# Magic byte signatures
MAGIC_BYTES = {
    "jpeg": b"\xff\xd8\xff",
    "png": b"\x89PNG\r\n\x1a\n",
    "webp": b"RIFF"  # and WEBP at bytes 8-12
}


class ImageValidationService:
    def __init__(self):
        self.max_size = settings.MAX_UPLOAD_SIZE_BYTES
        self.min_dim = settings.MIN_IMAGE_DIMENSION
        self.max_dim = settings.MAX_IMAGE_DIMENSION

    def validate_and_decode(self, image_input: Union[bytes, str, Image.Image]) -> Tuple[Image.Image, bytes]:
        """
        Validates raw image bytes or base64 string, checks magic bytes,
        decodes safely with PIL, verifies dimensions, and returns (PIL.Image, clean_bytes).
        """
        raw_bytes: bytes

        if isinstance(image_input, Image.Image):
            buf = io.BytesIO()
            image_input.convert("RGB").save(buf, format="JPEG", quality=95)
            raw_bytes = buf.getvalue()
        elif isinstance(image_input, str):
            clean_b64 = image_input
            if "base64," in clean_b64:
                clean_b64 = clean_b64.split("base64,")[1]
            try:
                raw_bytes = base64.b64decode(clean_b64)
            except Exception as e:
                raise ImageValidationError("Base64 string is invalid or corrupted.") from e
        elif isinstance(image_input, bytes):
            raw_bytes = image_input
        else:
            raise ImageValidationError("Unsupported input type for image validation.")

        # 1. Size restriction
        byte_len = len(raw_bytes)
        if byte_len < 32:
            raise ImageValidationError("Uploaded image file is empty or corrupted (payload < 32 bytes).")

        if byte_len > self.max_size:
            max_mb = self.max_size / (1024 * 1024)
            actual_mb = byte_len / (1024 * 1024)
            raise ImageTooLargeError(
                f"Image size exceeds the maximum limit of {max_mb:.1f} MB (uploaded {actual_mb:.1f} MB)."
            )

        # 2. Magic byte / Signature verification
        detected_format = self._verify_magic_bytes(raw_bytes)
        if not detected_format:
            raise ImageValidationError(
                "Unsupported file format. Please upload a genuine JPEG, PNG, or WebP image."
            )

        # 3. Decode image and check for corruption
        try:
            stream = io.BytesIO(raw_bytes)
            with Image.open(stream) as img:
                # Verify image integrity
                img.verify()

            # Re-open for actual processing (verify closes stream in PIL)
            stream.seek(0)
            pil_img = Image.open(stream)
            # Correct EXIF rotation if present
            pil_img = ImageOps.exif_transpose(pil_img) or pil_img
            pil_img = pil_img.convert("RGB")
        except Image.DecompressionBombError as e:
            logger.warning(f"Decompression bomb attempt prevented: {e}")
            raise ImageValidationError("Image exceeds safe pixel density limits (decompression bomb protection).") from e
        except Exception as e:
            logger.error(f"Image decode failure: {e}")
            raise ImageValidationError("Image file is corrupted or unreadable.") from e

        # 4. Dimension constraints
        width, height = pil_img.size
        if width < self.min_dim or height < self.min_dim:
            raise ImageValidationError(
                f"Image resolution too small ({width}x{height}px). Minimum required is {self.min_dim}x{self.min_dim}px."
            )

        if width > self.max_dim or height > self.max_dim:
            # Constrain dimensions to prevent excessive memory spikes
            pil_img.thumbnail((self.max_dim, self.max_dim), Image.Resampling.BILINEAR)

        return pil_img, raw_bytes

    def _verify_magic_bytes(self, data: bytes) -> Optional[str]:
        """Inspects file header magic bytes directly."""
        if data.startswith(MAGIC_BYTES["jpeg"]):
            return "JPEG"
        if data.startswith(MAGIC_BYTES["png"]):
            return "PNG"
        if data[:4] == MAGIC_BYTES["webp"] and len(data) >= 12 and data[8:12] == b"WEBP":
            return "WEBP"
        return None


# Global service instance
image_validation_service = ImageValidationService()
