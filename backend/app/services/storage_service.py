"""
DermaNova Cloud & Private Storage Service
==========================================
Manages storage, retrieval, and deletion of:
1. Patient facial scans (Bucket: 'patient-scans')
2. Diagnostic attention heatmaps (Bucket: 'diagnostic-heatmaps')

Supports:
- Supabase Storage REST API
- Local private filesystem fallback
- Secure ownership-isolated paths: {user_id}/{prefix}_{uuid}.jpg
- Safe file deletion on analysis removal
"""

import os
import uuid
import base64
import logging
from pathlib import Path
from typing import Optional
import httpx

from backend.app.core.config import settings

logger = logging.getLogger("dermanova.services.storage")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
LOCAL_UPLOADS_DIR = ROOT_DIR / "uploads"
LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/")
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.bucket_scans = settings.STORAGE_BUCKET_SCANS
        self.bucket_heatmaps = settings.STORAGE_BUCKET_HEATMAPS
        self.is_configured = bool(self.supabase_url and self.supabase_key)

    async def upload_image_bytes(
        self,
        image_bytes: bytes,
        user_id: str,
        bucket_name: str,
        filename_prefix: str = "scan",
        content_type: str = "image/jpeg"
    ) -> str:
        """Uploads image bytes under the user's isolated folder."""
        ext = "png" if "png" in content_type else "jpg"
        file_path = f"{user_id}/{filename_prefix}_{uuid.uuid4().hex[:8]}.{ext}"

        if self.is_configured:
            try:
                upload_endpoint = f"{self.supabase_url}/storage/v1/object/{bucket_name}/{file_path}"
                headers = {
                    "Authorization": f"Bearer {self.supabase_key}",
                    "apikey": self.supabase_key,
                    "Content-Type": content_type,
                    "x-upsert": "true"
                }

                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(upload_endpoint, content=image_bytes, headers=headers)
                    if resp.status_code in (200, 201):
                        return f"{self.supabase_url}/storage/v1/object/public/{bucket_name}/{file_path}"
                    else:
                        logger.warning(f"Supabase Storage responded with status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Supabase Storage upload error: {e}. Falling back to local storage.")

        # Local storage fallback
        user_dir = LOCAL_UPLOADS_DIR / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        local_file = user_dir / f"{filename_prefix}_{uuid.uuid4().hex[:8]}.{ext}"
        try:
            with open(local_file, "wb") as f:
                f.write(image_bytes)
            return f"/uploads/{user_id}/{local_file.name}"
        except Exception as e:
            logger.error(f"Local storage write error: {e}")
            b64_str = base64.b64encode(image_bytes).decode("ascii")
            return f"data:{content_type};base64,{b64_str}"

    async def upload_scan(self, image_bytes: bytes, user_id: str) -> str:
        """Uploads raw facial selfie scan."""
        return await self.upload_image_bytes(
            image_bytes=image_bytes,
            user_id=user_id,
            bucket_name=self.bucket_scans,
            filename_prefix="face_scan",
            content_type="image/jpeg"
        )

    async def upload_heatmap(self, heatmap_input: str, user_id: str) -> str:
        """Uploads Grad-CAM heatmap (accepts base64 data URL or raw bytes)."""
        if isinstance(heatmap_input, str) and "base64," in heatmap_input:
            raw_b64 = heatmap_input.split("base64,")[1]
            heatmap_bytes = base64.b64decode(raw_b64)
        elif isinstance(heatmap_input, bytes):
            heatmap_bytes = heatmap_input
        else:
            return ""

        return await self.upload_image_bytes(
            image_bytes=heatmap_bytes,
            user_id=user_id,
            bucket_name=self.bucket_heatmaps,
            filename_prefix="gradcam",
            content_type="image/png"
        )

    async def delete_file(self, file_url: Optional[str], user_id: str) -> bool:
        """
        Safely deletes a retained scan or heatmap from Supabase Storage or local disk.
        Enforces user_id ownership check on the path.
        """
        if not file_url:
            return False

        # 1. Handle local file deletion
        if file_url.startswith("/uploads/"):
            rel_path = file_url.replace("/uploads/", "", 1)
            # Ensure path starts with user_id to prevent path traversal
            if not rel_path.startswith(f"{user_id}/"):
                logger.warning(f"Path traversal attempt or user mismatch during delete: {file_url}")
                return False

            local_path = LOCAL_UPLOADS_DIR / rel_path
            try:
                if local_path.exists():
                    local_path.unlink()
                    logger.info(f"Deleted local file: {local_path}")
                    return True
            except Exception as e:
                logger.error(f"Failed to delete local file {local_path}: {e}")
                return False

        # 2. Handle Supabase Storage deletion
        if self.is_configured and self.supabase_url in file_url:
            try:
                # Extract bucket and file path from URL
                # Format: .../storage/v1/object/public/{bucket_name}/{file_path}
                marker = "/storage/v1/object/public/"
                if marker in file_url:
                    parts = file_url.split(marker)[1].split("/", 1)
                    if len(parts) == 2:
                        bucket_name, file_path = parts[0], parts[1]
                        # Verify user_id prefix
                        if not file_path.startswith(f"{user_id}/"):
                            logger.warning(f"Storage path does not match user_id: {file_path}")
                            return False

                        delete_endpoint = f"{self.supabase_url}/storage/v1/object/{bucket_name}/{file_path}"
                        headers = {
                            "Authorization": f"Bearer {self.supabase_key}",
                            "apikey": self.supabase_key
                        }
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            resp = await client.delete(delete_endpoint, headers=headers)
                            if resp.status_code in (200, 204):
                                logger.info(f"Deleted Supabase Storage object: {file_path}")
                                return True
                            else:
                                logger.warning(f"Supabase delete failed ({resp.status_code}): {resp.text}")
            except Exception as e:
                logger.error(f"Supabase storage delete error: {e}")
                return False

        return False


# Global storage service instance
storage_service = StorageService()
