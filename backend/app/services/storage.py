"""
DermaNova Cloud Storage Service (Supabase Storage)
===================================================
Manages encrypted storage and retrieval of:
1. Patient clinical selfies (bucket: 'patient-scans')
2. Grad-CAM diagnostic attention heatmaps (bucket: 'diagnostic-heatmaps')

Uses Supabase Storage REST API via HTTPX with an automatic offline local fallback.
"""

import os
import uuid
import base64
from pathlib import Path
from typing import Optional, Tuple
import httpx

from backend.app.core.config import settings

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
LOCAL_UPLOADS_DIR = ROOT_DIR / "uploads"
LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class SupabaseStorageService:
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
        """
        Uploads image bytes to Supabase Storage bucket under the user's isolated folder.
        Path pattern: {user_id}/{filename_prefix}_{uuid}.jpg
        """
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
                        # Return public or authenticated access URL
                        public_url = f"{self.supabase_url}/storage/v1/object/public/{bucket_name}/{file_path}"
                        return public_url
                    else:
                        print(f"[Supabase Storage Warning] Cloud upload returned {resp.status_code}: {resp.text}")
            except Exception as e:
                print(f"[Supabase Storage Error] Cloud upload failed: {e}. Falling back to local/data URL.")

        # Local fallback if Supabase not configured or request fails
        user_dir = LOCAL_UPLOADS_DIR / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        local_file = user_dir / f"{filename_prefix}_{uuid.uuid4().hex[:8]}.{ext}"
        try:
            with open(local_file, "wb") as f:
                f.write(image_bytes)
            return f"/uploads/{user_id}/{local_file.name}"
        except Exception:
            # Last resort: base64 data URL
            b64_str = base64.b64encode(image_bytes).decode("ascii")
            return f"data:{content_type};base64,{b64_str}"

    async def upload_scan(self, image_bytes: bytes, user_id: str) -> str:
        """Upload raw facial selfie scan."""
        return await self.upload_image_bytes(
            image_bytes=image_bytes,
            user_id=user_id,
            bucket_name=self.bucket_scans,
            filename_prefix="face_scan",
            content_type="image/jpeg"
        )

    async def upload_heatmap(self, heatmap_input: str, user_id: str) -> str:
        """Upload Grad-CAM heatmap (accepts base64 data URL or bytes)."""
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


# Global storage instance
storage_service = SupabaseStorageService()
