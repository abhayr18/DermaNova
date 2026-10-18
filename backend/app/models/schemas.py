from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class SkinTypeEnum(str, Enum):
    NORMAL = "Normal"
    OILY = "Oily"
    DRY = "Dry"
    COMBINATION = "Combination"
    SENSITIVE = "Sensitive"


class SeverityLevelEnum(str, Enum):
    CLEAR = "Clear / Minimal"
    MILD = "Mild"
    MODERATE = "Moderate"
    SEVERE = "Severe"
    AMBIGUOUS_RANGE = "Mild-to-Moderate"


class ConditionScore(BaseModel):
    condition_id: str
    display_name: str
    probability: float = Field(..., ge=0.0, le=1.0)
    severity_level: SeverityLevelEnum
    is_detected: bool
    clinical_note: str


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
    category: str  # Cleanser, Serum, Treatment, Moisturizer, Sunscreen
    brand: Optional[str] = "DermaNova Clinical"
    key_actives: List[str]
    suitable_for_skin_types: List[str]
    price_range: str  # "$", "$$", "$$$"
    description: str


class RoutineStep(BaseModel):
    step_number: int
    step_name: str  # e.g. "Cleanse", "Treat", "Hydrate", "Protect"
    product_category: str
    recommended_action: str
    product_name: str
    key_actives: str
    frequency: str  # "Daily", "Alternate nights"


class DailyRoutine(BaseModel):
    morning_routine: List[RoutineStep]
    evening_routine: List[RoutineStep]
    weekly_treatments: List[str]
    lifestyle_and_diet: List[str]


class AnalysisResponse(BaseModel):
    analysis_id: str
    timestamp: str
    overall_health_score: int = Field(..., ge=0, le=100)
    detected_skin_type: SkinTypeEnum
    conditions: Dict[str, ConditionScore]
    top_concerns: List[str]
    acne_severity_grade: SeverityLevelEnum
    heatmap_image_base64: Optional[str] = None
    face_detected: bool = True
    clinical_disclaimer: str
    requires_clinical_referral: bool = False


class RecommendationRequest(BaseModel):
    analysis_id: Optional[str] = None
    detected_conditions: Optional[Dict[str, float]] = None
    skin_type: Optional[SkinTypeEnum] = SkinTypeEnum.NORMAL
    age_group: Optional[str] = "20-30"
    concerns: Optional[List[str]] = []
    has_sensitive_skin: Optional[bool] = False
    allergies: Optional[List[str]] = []


class RecommendationResponse(BaseModel):
    recommendation_id: str
    primary_active_ingredients: List[ActiveIngredient]
    contraindications_avoided: List[str]
    curated_products: List[SkincareProduct]
    daily_routine: DailyRoutine
    dietary_guidance: List[str]
    barrier_health_tips: List[str]
