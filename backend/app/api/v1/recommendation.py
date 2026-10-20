from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    SkinTypeEnum
)
from backend.app.services.recommender import recommender_service

router = APIRouter(prefix="/recommend", tags=["Skincare Recommendations"])


@router.post("", response_model=RecommendationResponse, summary="Generate personalized pharmacological skincare guidance")
async def generate_recommendations(request: RecommendationRequest):
    """
    Accepts diagnosed condition severity scores and user profile parameters,
    and returns evidence-based active ingredients, safe curated products,
    structured AM/PM routines, and dietary recommendations.
    Requires valid condition scores from a prior skin analysis.
    """
    conditions = request.detected_conditions or {}

    if not conditions:
        raise HTTPException(
            status_code=400,
            detail="No skin condition scores provided. Please run a skin analysis first using /api/v1/analyze."
        )

    # Validate that condition values are within expected range
    for cond_name, score in conditions.items():
        if not (0.0 <= score <= 1.0):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid score for condition '{cond_name}': {score}. Scores must be between 0.0 and 1.0."
            )

    try:
        response = recommender_service.generate_recommendations(
            detected_conditions=conditions,
            skin_type=request.skin_type or SkinTypeEnum.NORMAL,
            has_sensitive_skin=request.has_sensitive_skin or False,
            allergies=request.allergies
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")
