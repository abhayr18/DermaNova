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
    """
    conditions = request.detected_conditions or {}
    
    # If no conditions were explicitly provided, use default balanced scores
    if not conditions:
        conditions = {
            "acne": 0.48,
            "blackheads": 0.45,
            "pores": 0.52,
            "dark_spots": 0.35,
            "redness": 0.25,
            "wrinkles": 0.20,
            "pigmentation": 0.15,
            "whiteheads": 0.10
        }

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
