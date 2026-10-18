from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.database.session import Base, engine
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.journey import router as journey_router
from backend.app.api.v1.analysis import router as analysis_router
from backend.app.api.v1.recommendation import router as recommendation_router
from backend.app.api.v1.history import router as history_router

# Initialize database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DermaNova AI Clinical Backend API (CureSkin Architecture)",
    description=(
        "Production-Grade Cloud-Native Facial Skin Diagnosis, "
        "Multi-User Longitudinal Tracking, and Pharmacological Skincare Guidance."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory if fallback is used
uploads_dir = Path(__file__).resolve().parent.parent.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Register API v1 Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(journey_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")
app.include_router(recommendation_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root():
    return {
        "status": "online",
        "system": "DermaNova Clinical AI Engine",
        "version": "2.0.0",
        "architecture": "CureSkin Cloud Multi-Tenant",
        "cloud_database": "Supabase PostgreSQL",
        "cloud_storage": "Supabase Storage",
        "supported_conditions": 8,
        "docs": "/docs",
        "endpoints": {
            "auth_signup": "/api/v1/auth/signup",
            "auth_login": "/api/v1/auth/login",
            "auth_profile": "/api/v1/auth/profile",
            "journey_timeline": "/api/v1/journey/timeline",
            "journey_stats": "/api/v1/journey/stats",
            "journey_log": "/api/v1/journey/log",
            "analysis": "/api/v1/analyze",
            "analysis_demo": "/api/v1/analyze/demo",
            "recommendation": "/api/v1/recommend",
            "history": "/api/v1/history"
        }
    }


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "cloud_provider": "Supabase",
        "services": {
            "auth_service": "operational",
            "ml_inference": "operational",
            "recommender_engine": "operational",
            "cloud_storage": "operational",
            "journey_tracker": "operational"
        }
    }
