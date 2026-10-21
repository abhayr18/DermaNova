"""
DermaNova Analyses RESTful Endpoints
=====================================
Endpoints:
- POST   /api/v1/analyses: Create new analysis from uploaded image (multipart/form-data)
- GET    /api/v1/analyses: Retrieve authenticated user's analysis history (paginated)
- GET    /api/v1/analyses/{analysis_id}: Retrieve single analysis record with ownership check
- DELETE /api/v1/analyses/{analysis_id}: Delete analysis record and linked images with ownership check
"""

import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user, get_optional_user
from backend.app.core.exceptions import ResourceNotFoundError, AuthorizationError, ImageValidationError
from backend.app.database.session import get_db
from backend.app.database.models import User, SkinAssessment
from backend.app.schemas.analysis import AnalysisResponse, AnalysisRecordSummary
from backend.app.schemas.common import PaginatedResponse
from backend.app.services.analysis_service import analysis_service
from backend.app.services.storage_service import storage_service
from backend.app.db.repositories.analysis_repository import AnalysisRepository

logger = logging.getLogger("dermanova.api.analyses")

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.post(
    "",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create facial skin analysis from uploaded image"
)
async def create_analysis(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Accepts multipart/form-data containing a clinical facial image.
    Executes validation, optical quality checks, preprocessing, deep learning inference,
    and returns structured condition findings with curated recommendations.
    If authenticated, automatically persists to user account and storage.
    """
    if not file:
        raise ImageValidationError("No image file provided.")

    image_bytes = await file.read()
    if not image_bytes:
        raise ImageValidationError("Uploaded image file is empty.")

    try:
        result = await analysis_service.run_analysis(
            image_input=image_bytes,
            user=current_user,
            db=db
        )
        return result
    except Exception as e:
        logger.warning(f"analysis_service failed ({e}), falling back to predictor_service: {e}")
        from ml_pipeline.inference.predictor import predictor_service
        from backend.app.api.v1.analysis import _save_assessment_and_routine
        legacy_result = predictor_service.predict(image_bytes)
        if current_user and db:
            await _save_assessment_and_routine(legacy_result, image_bytes, current_user, db)
        return legacy_result



@router.get(
    "",
    response_model=PaginatedResponse[AnalysisRecordSummary],
    summary="List authenticated user's historical analyses"
)
async def list_analyses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only the authenticated patient's historical analyses,
    ordered chronologically descending with pagination metadata.
    """
    repo = AnalysisRepository(db)
    items, total = repo.list_by_user(user_id=current_user.id, page=page, page_size=page_size)

    summaries = []
    for r in items:
        summaries.append(
            AnalysisRecordSummary(
                analysis_id=r.id,
                created_at=r.created_at.isoformat() if r.created_at else "",
                status="completed",
                overall_health_score=r.overall_health_score,
                detected_skin_type=r.detected_skin_type,
                primary_concern=r.primary_concern,
                acne_severity_grade=r.acne_severity_grade,
                requires_clinical_referral=r.requires_clinical_referral,
                image_url=r.image_cloud_url,
                heatmap_url=r.heatmap_cloud_url,
                notes=r.clinical_notes or ""
            )
        )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[AnalysisRecordSummary](
        items=summaries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get(
    "/{analysis_id}",
    response_model=AnalysisRecordSummary,
    summary="Retrieve single analysis by ID"
)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves saved analysis record after strictly validating that it belongs to the authenticated user.
    """
    repo = AnalysisRepository(db)
    record = repo.get_by_id_and_user(analysis_id, current_user.id)
    if not record:
        raise ResourceNotFoundError(f"Analysis '{analysis_id}' not found.")

    return AnalysisRecordSummary(
        analysis_id=record.id,
        created_at=record.created_at.isoformat() if record.created_at else "",
        status="completed",
        overall_health_score=record.overall_health_score,
        detected_skin_type=record.detected_skin_type,
        primary_concern=record.primary_concern,
        acne_severity_grade=record.acne_severity_grade,
        requires_clinical_referral=record.requires_clinical_referral,
        image_url=record.image_cloud_url,
        heatmap_url=record.heatmap_cloud_url,
        notes=record.clinical_notes or ""
    )


@router.delete(
    "/{analysis_id}",
    summary="Delete analysis record and associated retained images"
)
async def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes the analysis assessment record and attempts to delete any
    associated retained images in cloud storage or local disk.
    Enforces strict user ownership.
    """
    repo = AnalysisRepository(db)
    deleted_record = repo.delete(analysis_id, current_user.id)

    # Clean up associated retained storage assets
    image_deleted = False
    heatmap_deleted = False
    try:
        if deleted_record.image_cloud_url:
            image_deleted = await storage_service.delete_file(deleted_record.image_cloud_url, current_user.id)
        if deleted_record.heatmap_cloud_url:
            heatmap_deleted = await storage_service.delete_file(deleted_record.heatmap_cloud_url, current_user.id)
    except Exception as e:
        logger.warning(f"Storage asset cleanup notice for {analysis_id}: {e}")

    return {
        "status": "deleted",
        "analysis_id": analysis_id,
        "image_deleted": image_deleted,
        "heatmap_deleted": heatmap_deleted,
        "message": "Analysis record and associated data successfully removed."
    }
