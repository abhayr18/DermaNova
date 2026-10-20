"""
DermaNova Recommendations RESTful Endpoints
============================================
GET /api/v1/recommendations/{analysis_id}: Retrieve pharmacological recommendations
linked to a specific historical analysis record after user authorization.
"""

import json
import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.core.exceptions import ResourceNotFoundError, AuthorizationError
from backend.app.database.session import get_db
from backend.app.database.models import User, SkinAssessment
from backend.app.schemas.recommendation import RecommendationResponse
from backend.app.services.recommendation_service import recommendation_service

logger = logging.getLogger("dermanova.api.recommendations")

router = APIRouter(prefix="/recommendations", tags=["Skincare Recommendations"])


@router.get(
    "/{analysis_id}",
    response_model=RecommendationResponse,
    summary="Get recommendations associated with an analysis"
)
async def get_analysis_recommendations(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves skincare recommendations associated with a prior analysis,
    verifying that the record belongs to the authenticated user.
    """
    record = db.query(SkinAssessment).filter(SkinAssessment.id == analysis_id).first()
    if not record:
        raise ResourceNotFoundError(f"Analysis '{analysis_id}' not found.")

    if record.user_id != current_user.id and current_user.role != "admin":
        raise AuthorizationError("You do not have permission to view recommendations for this analysis.")

    condition_scores = record.get_condition_scores()
    has_sensitive = (
        record.detected_skin_type == "Sensitive" or
        (current_user.profile and current_user.profile.has_sensitive_skin)
    )
    user_allergies = current_user.profile.get_allergies() if current_user.profile else []
    is_pregnant = bool(current_user.profile and current_user.profile.is_pregnant_or_nursing)

    recs = recommendation_service.generate_recommendations(
        detected_conditions=condition_scores,
        skin_type=record.detected_skin_type,
        has_sensitive_skin=has_sensitive,
        allergies=user_allergies,
        is_pregnant_or_nursing=is_pregnant,
        analysis_id=record.id
    )
    return recs
