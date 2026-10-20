"""
DermaNova Model Info Metadata Endpoint
=======================================
GET /api/v1/model-info: Returns public model architecture and diagnostic capability metadata.
Never exposes checkpoint weights or private filesystem paths.
"""

from fastapi import APIRouter
from backend.app.ml.model_loader import model_loader
from backend.app.ml.class_mapping import DERMANOVA_CONDITION_KEYS

router = APIRouter(tags=["Model Metadata"])


@router.get("/model-info", summary="Public ML model metadata and capability specifications")
async def get_model_info():
    """
    Returns verified model capabilities, supported conditions, input resolution,
    and inference readiness.
    """
    info = model_loader.get_info()
    return {
        "model_name": info["model_name"],
        "model_version": info["model_version"],
        "architecture": info["architecture"],
        "input_resolution": info["input_resolution"],
        "is_ready": info["is_ready"],
        "supported_conditions": info["supported_conditions"],
        "severity_grades": info["severity_grades"],
        "skin_types": info["skin_types"],
        "capabilities": [
            "Multi-label facial skin condition diagnosis (8 classes)",
            "3-grade ordinal acne severity ranking",
            "5-class biophysical skin-type classification",
            "Saliency & authentic Grad-CAM spatial attention mapping",
            "Rule-based pharmacological routine personalization"
        ]
    }
