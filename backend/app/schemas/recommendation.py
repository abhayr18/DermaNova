"""
DermaNova Recommendation Schemas
=================================
Pydantic schemas for skincare guidance, active ingredients, and personalized regimens.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ActiveIngredient(BaseModel):
    name: str
    target_condition: str
    recommended_strength: str
    mechanism_of_action: str
    application_timing: str  # "AM", "PM", or "Both"
    precaution: str
    barrier_support_pairing: str


class SkincareProduct(BaseModel):
    product_name: str
    category: str
    brand: Optional[str] = "DermaNova Clinical"
    key_actives: List[str]
    suitable_for_skin_types: List[str]
    price_range: str
    description: str


class RoutineStep(BaseModel):
    step_number: int
    step_name: str
    product_category: str
    recommended_action: str
    product_name: str
    key_actives: str
    frequency: str


class DailyRoutine(BaseModel):
    morning_routine: List[RoutineStep]
    evening_routine: List[RoutineStep]
    weekly_treatments: List[str] = []
    lifestyle_and_diet: List[str] = []


class RecommendationResponse(BaseModel):
    recommendation_id: str
    analysis_id: Optional[str] = None
    primary_active_ingredients: List[ActiveIngredient]
    contraindications_avoided: List[str] = []
    curated_products: List[SkincareProduct] = []
    daily_routine: DailyRoutine
    dietary_guidance: List[str] = []
    barrier_health_tips: List[str] = []
    clinical_disclaimer: str = (
        "DermaNova provides educational skincare guidance. "
        "These recommendations do not constitute medical diagnosis or prescription. "
        "Consult a dermatologist for persistent or severe skin concerns."
    )
