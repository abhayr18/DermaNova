"""
DermaNova Cloud & Application Configuration
=============================================
Manages environment variables for:
- Supabase (PostgreSQL, Storage, Auth)
- JWT Token issuance & verification
- Clinical Inference thresholds
"""

import os
from pathlib import Path
from typing import List

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings:
    # System Info
    PROJECT_NAME: str = "DermaNova Clinical AI"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Cloud Database: Supabase PostgreSQL / Local Fallback
    # Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
    DEFAULT_SQLITE_URL: str = f"sqlite:///{ROOT_DIR / 'dermanova_clinical.db'}"
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

    # Supabase Cloud Infrastructure
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Storage Buckets in Supabase
    STORAGE_BUCKET_SCANS: str = "patient-scans"
    STORAGE_BUCKET_HEATMAPS: str = "diagnostic-heatmaps"

    # Application JWT Security (Fallback / Native)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dermanova-clinical-production-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS Whitelist
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]


settings = Settings()
