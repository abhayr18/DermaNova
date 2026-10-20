"""
DermaNova Health & Readiness Endpoints
=======================================
GET /api/v1/health: Verifies API liveness, database connectivity, and ML model readiness.
Returns HTTP 200 when operational, HTTP 503 when degraded/unhealthy.
"""

import logging
from fastapi import APIRouter, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.database.session import SessionLocal
from backend.app.ml.model_loader import model_loader
from backend.app.services.storage_service import storage_service
from ml_pipeline.inference.predictor import predictor_service

logger = logging.getLogger("dermanova.api.health")

router = APIRouter(tags=["System Health"])


@router.get("/health", summary="Service health and readiness check")
async def health_check():
    """
    Evaluates:
    1. Database connectivity
    2. ML Model inference readiness
    3. Storage service configuration
    Returns 503 if database or ML inference is unavailable.
    """
    services = {}

    # 1. Database check
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        services["database"] = "operational"
    except Exception as e:
        logger.error(f"Health check DB failure: {e}")
        services["database"] = f"unhealthy: {str(e)}"

    # 2. ML Inference readiness (PyTorch or ONNX Runtime)
    if getattr(model_loader, "is_loaded", False) or getattr(predictor_service, "is_model_loaded", False):
        services["ml_inference"] = "operational"
    else:
        # Check if lazy load is possible
        try:
            if getattr(model_loader, "has_torch", False):
                model_loader.load()
                services["ml_inference"] = "operational"
            elif getattr(predictor_service, "is_model_loaded", False):
                services["ml_inference"] = "operational"
            else:
                services["ml_inference"] = "unavailable: no weights loaded"
        except Exception as e:
            services["ml_inference"] = f"unavailable: {str(e)}"

    # 3. Recommender engine
    services["recommender_engine"] = "operational"

    # 4. Storage service
    services["cloud_storage"] = "operational" if storage_service.is_configured else "local_fallback"

    is_healthy = (
        services["database"] == "operational" and
        services["ml_inference"] == "operational"
    )

    payload = {
        "status": "healthy" if is_healthy else "degraded",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "services": services
    }

    if not is_healthy:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload
        )

    return payload
