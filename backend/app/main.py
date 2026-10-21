"""
DermaNova Clinical AI Backend Application Entry Point
======================================================
FastAPI application with:
1. Lifespan startup/shutdown management
2. Multi-tenant database connection management
3. Safe PyTorch model initialization (weights_only=True)
4. Domain exception handlers and validation interceptors
5. Versioned API routers (/api/v1) and OpenAPI documentation
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging
from backend.app.core.exceptions import (
    DermaNovaBaseException,
    dermanova_exception_handler,
    validation_exception_handler
)
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.services.storage_service import storage_service
from backend.app.ml.model_loader import model_loader
from ml_pipeline.inference.predictor import predictor_service
from backend.app.api.router import api_v1_router

# Setup structured logger
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup & shutdown lifecycle management for DermaNova:
    1. Validates production environment constraints (JWT, PostgreSQL)
    2. Initializes database schema tables
    3. Loads and warms up the verified PyTorch ML model (weights_only=True)
    4. Confirms Supabase storage configuration
    """
    logger.info("Initializing DermaNova Clinical AI Backend...")

    # 1. Validate environment configuration
    settings.validate_production_environment()

    # 2. Schema check / initialization
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.error(f"Database schema initialization warning: {e}")

    # 3. Model readiness (PyTorch singleton or ONNX Runtime)
    try:
        if getattr(model_loader, "has_torch", False) and getattr(model_loader, "checkpoint_path", None) and model_loader.checkpoint_path.exists():
            model_loader.load()
            logger.info(
                f"PyTorch Model loaded and verified on device: {model_loader.device}. "
                f"Trained epoch: {model_loader.checkpoint_metadata.get('epoch')}"
            )
        else:
            logger.info("PyTorch weights not active; utilizing lightweight ONNX Runtime inference engine.")
            if predictor_service.is_model_loaded:
                logger.info(f"ONNX Model engine loaded: {predictor_service.active_model_type}")
    except Exception as e:
        logger.warning(f"Model loader initialization notice: {e}")

    # 4. Cloud storage check
    if storage_service.is_configured:
        logger.info(f"Supabase Cloud Storage configured at {storage_service.supabase_url}")
    else:
        logger.info("Supabase credentials not set; using local filesystem storage fallback.")

    yield

    logger.info("DermaNova Backend shutting down.")


app = FastAPI(
    title="DermaNova AI Clinical Backend API",
    description=(
        "Production-Grade Cloud-Native Facial Skin Diagnosis, "
        "Multi-User Longitudinal Tracking, and Pharmacological Skincare Guidance."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Exception Handlers
app.add_exception_handler(DermaNovaBaseException, dermanova_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An internal diagnostic processing error occurred. Please retry with a clear facial photo.",
            "details": str(exc) if settings.DEBUG else None
        },
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory if fallback is used
uploads_dir = Path(__file__).resolve().parent.parent.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Register Central API v1 Router
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root():
    return {
        "status": "online",
        "system": "DermaNova Clinical AI Engine",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "cloud_database": "PostgreSQL (Supabase)" if not settings.DATABASE_URL.startswith("sqlite") else "SQLite (Local)",
        "cloud_storage": "Supabase Storage" if storage_service.is_configured else "Local Storage Fallback",
        "supported_conditions": 8,
        "docs": "/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "model_info": "/api/v1/model-info",
            "analyses": "/api/v1/analyses",
            "recommendations": "/api/v1/recommendations/{analysis_id}",
            "auth_signup": "/api/v1/auth/signup",
            "auth_login": "/api/v1/auth/login",
            "auth_profile": "/api/v1/auth/profile",
            "journey_timeline": "/api/v1/journey/timeline",
            "journey_stats": "/api/v1/journey/stats",
            "journey_log": "/api/v1/journey/log",
            "legacy_analyze": "/api/v1/analyze",
            "legacy_recommend": "/api/v1/recommend",
            "legacy_history": "/api/v1/history"
        }
    }


@app.get("/health", tags=["System"])
async def root_health_check():
    """Root-level health check alias."""
    services = {}

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        services["database"] = "operational"
    except Exception as e:
        logger.error(f"Health check DB failure: {e}")
        services["database"] = f"unhealthy: {str(e)}"

    is_ml_ready = model_loader.is_loaded or predictor_service.is_model_loaded
    services["ml_inference"] = "operational" if is_ml_ready else "unavailable: no weights loaded"
    services["recommender_engine"] = "operational"
    services["cloud_storage"] = "operational" if storage_service.is_configured else "local_fallback"

    is_healthy = (
        services["database"] == "operational" and
        services["ml_inference"] == "operational"
    )

    payload = {
        "status": "healthy" if is_healthy else "degraded",
        "environment": settings.ENVIRONMENT,
        "services": services
    }

    if not is_healthy:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload
        )

    return payload
