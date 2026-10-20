"""
DermaNova Analysis Pydantic Schemas
====================================
Request and response models for facial skin analysis, structured findings,
model scores, lesion annotations, and historical assessment records.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

from backend.app.ml.class_mapping import SeverityLevelEnum, SkinTypeEnum
from backend.app.schemas.recommendation import RecommendationResponse


class BoundingBox(BaseModel):
    x: float = Field(..., description="Left offset percentage (0 to 100)")
    y: float = Field(..., description="Top offset percentage (0 to 100)")
    width: float = Field(..., description="Box width percentage (0 to 100)")
    height: float = Field(..., description="Box height percentage (0 to 100)")


class DetectedLesion(BaseModel):
    id: str
    condition_id: str
    condition_name: str
    confidence: float
    severity: str
    location_label: str
    box: BoundingBox
    color: str
    clinical_finding: str
    recommended_active: str


class ConditionScore(BaseModel):
    condition_id: str
    display_name: str
    probability: float = Field(..., ge=0.0, le=1.0, description="Model sigmoid score [0.0, 1.0]")
    severity_level: SeverityLevelEnum
    is_detected: bool = Field(..., description="True if score passes calibrated detection threshold")
    clinical_note: str


class Base64AnalysisPayload(BaseModel):
    image_base64: str = Field(..., description="Raw Base64 encoded JPEG/PNG/WebP image string")
    skin_type_hint: Optional[str] = None


class AnalysisRecordSummary(BaseModel):
    analysis_id: str
    created_at: str
    status: str
    overall_health_score: int
    detected_skin_type: SkinTypeEnum
    primary_concern: str
    acne_severity_grade: SeverityLevelEnum
    requires_clinical_referral: bool
    image_url: Optional[str] = None
    heatmap_url: Optional[str] = None
    notes: Optional[str] = ""


class AnalysisResponse(BaseModel):
    """
    Standard analysis result schema.
    Fully compatible with RESTful specifications and the existing Next.js frontend dashboard.
    """
    analysis_id: str
    status: str = "completed"
    timestamp: str
    model_version: str = "2.0.0-efficientnet-b0"
    overall_health_score: int = Field(..., ge=0, le=100)
    detected_skin_type: SkinTypeEnum
    conditions: Dict[str, ConditionScore]
    top_concerns: List[str]
    acne_severity_grade: SeverityLevelEnum
    requires_clinical_referral: bool = False
    heatmap_image_base64: Optional[str] = None
    face_detected: bool = True
    clinical_disclaimer: str = (
        "DermaNova provides AI-assisted educational skincare assessment. "
        "These findings do not constitute medical diagnosis or prescription. "
        "Consult a board-certified dermatologist for persistent or severe dermatological conditions."
    )
    detected_lesions: Optional[List[DetectedLesion]] = []
    recommendations: Optional[RecommendationResponse] = None
