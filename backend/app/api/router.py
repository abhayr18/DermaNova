"""
DermaNova Central API v1 Router
================================
Consolidates all modular and legacy endpoints under /api/v1:
- /health: Service liveness & readiness
- /model-info: Public ML model metadata
- /analyses: RESTful analysis upload, listing, retrieval, deletion
- /recommendations: Analysis-linked recommendations
- /auth: Patient authentication, intake quiz, profile
- /journey: Longitudinal tracking timeline, stats, routine logs
- Legacy aliases: /analyze, /recommend, /history
"""

from fastapi import APIRouter

from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.model_info import router as model_info_router
from backend.app.api.routes.analyses import router as analyses_router
from backend.app.api.routes.recommendations import router as recommendations_router

from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.journey import router as journey_router
from backend.app.api.v1.analysis import router as legacy_analysis_router
from backend.app.api.v1.recommendation import router as legacy_recommendation_router
from backend.app.api.v1.history import router as legacy_history_router

api_v1_router = APIRouter()

# Core modular endpoints
api_v1_router.include_router(health_router)
api_v1_router.include_router(model_info_router)
api_v1_router.include_router(analyses_router)
api_v1_router.include_router(recommendations_router)

# Account & Journey endpoints
api_v1_router.include_router(auth_router)
api_v1_router.include_router(journey_router)

# Backward-compatibility legacy routes
api_v1_router.include_router(legacy_analysis_router)
api_v1_router.include_router(legacy_recommendation_router)
api_v1_router.include_router(legacy_history_router)
