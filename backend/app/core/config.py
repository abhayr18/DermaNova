"""
DermaNova Cloud & Application Configuration
=============================================
Manages environment variables for:
- Supabase (PostgreSQL, Storage, Auth)
- JWT Token issuance & verification
- Clinical Inference thresholds
"""

import os
import logging
from pathlib import Path
from typing import List

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
logger = logging.getLogger("dermanova.config")

DEFAULT_INSECURE_SECRET = "dermanova-clinical-production-secret-key-2026"


class Settings:
    # System Info
    PROJECT_NAME: str = "DermaNova Clinical AI"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Cloud Database: Supabase PostgreSQL / Local Fallback
    DEFAULT_SQLITE_URL: str = f"sqlite:///{ROOT_DIR / 'dermanova_clinical.db'}"
    raw_db_url = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL: str = raw_db_url

    # Supabase Cloud Infrastructure
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Storage Buckets in Supabase
    STORAGE_BUCKET_SCANS: str = "patient-scans"
    STORAGE_BUCKET_HEATMAPS: str = "diagnostic-heatmaps"
    RETAIN_IMAGES_ENABLED: bool = os.getenv("RETAIN_IMAGES_ENABLED", "True").lower() == "true"

    # Upload Constraints (Section 6: Configurable maximum upload size, initially 5MB)
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(5 * 1024 * 1024)))  # 5MB
    ALLOWED_IMAGE_MIME_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    MIN_IMAGE_DIMENSION: int = 64
    MAX_IMAGE_DIMENSION: int = 4096
    MAX_PIXEL_COUNT: int = 25_000_000

    # ML Inference & Thresholds
    INFERENCE_DEVICE: str = os.getenv("INFERENCE_DEVICE", "auto")
    MODEL_CHECKPOINT_PATH: str = os.getenv("MODEL_CHECKPOINT_PATH", "")
    PREDICTION_THRESHOLD: float = float(os.getenv("PREDICTION_THRESHOLD", "0.38"))
    MODEL_VERSION: str = "2.0.0-efficientnet-b0"

    # Application JWT Security (Fallback / Native)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", DEFAULT_INSECURE_SECRET)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        raw = os.getenv("ALLOWED_ORIGINS", "")
        if raw:
            return [o.strip() for o in raw.split(",") if o.strip()]
        if self.ENVIRONMENT == "production":
            return [
                "https://dermanova.vercel.app",
            ]
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]

    def validate_production_environment(self) -> None:
        """Enforces security constraints when running in production mode."""
        if self.ENVIRONMENT == "production":
            if not self.JWT_SECRET_KEY or self.JWT_SECRET_KEY == DEFAULT_INSECURE_SECRET:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: "
                    "JWT_SECRET_KEY must be set to a secure, unpredictable 64-character secret in production. "
                    "Cannot run with default or empty key."
                )
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError(
                    "CRITICAL ARCHITECTURE CONFIGURATION ERROR: "
                    "DATABASE_URL cannot use SQLite in production. "
                    "Configure a persistent PostgreSQL instance (e.g., Supabase) via DATABASE_URL."
                )


settings = Settings()


