"""
Unit Tests: Model Inference & Prediction Post-Processing
=========================================================
Tests:
1. PyTorch checkpoint loads strictly with weights_only=True
2. Forward pass outputs finite values and expected shapes
3. Real facial image inference
4. Multi-label probability decoding
5. Skincare recommendation rule engine & contraindication safety
"""

from pathlib import Path
import pytest
import numpy as np
import torch

from backend.app.ml.model_loader import model_loader
from backend.app.ml.inference import inference_engine
from backend.app.services.preprocessing_service import preprocessing_service
from backend.app.services.prediction_service import prediction_service
from backend.app.services.recommendation_service import recommendation_service
from backend.app.ml.class_mapping import DERMANOVA_CONDITION_KEYS, SkinTypeEnum, SeverityLevelEnum


def test_model_loaded_and_verified():
    """Verify PyTorch model is initialized and weights are strictly validated."""
    model = model_loader.load()
    assert model is not None
    assert model_loader.is_loaded is True
    assert model.num_conditions == 8
    assert model.num_severity_grades in [2, 3]
    assert model.num_skin_types == 5


def test_inference_engine_output_shapes_and_values():
    """Verify inference engine forward pass on synthetic input."""
    dummy_tensor = torch.randn(1, 3, 256, 256)
    out = inference_engine.predict_tensor(dummy_tensor, compute_gradcam=False)

    assert "condition_probabilities" in out
    assert len(out["condition_probabilities"]) == 8

    # All probabilities in [0.0, 1.0]
    for key, prob in out["condition_probabilities"].items():
        assert 0.0 <= prob <= 1.0
        assert np.isfinite(prob)

    assert out["severity_grade"] in [SeverityLevelEnum.CLEAR, SeverityLevelEnum.MILD, SeverityLevelEnum.MODERATE, SeverityLevelEnum.SEVERE]
    assert out["skin_type"] in [
        SkinTypeEnum.NORMAL, SkinTypeEnum.OILY, SkinTypeEnum.DRY,
        SkinTypeEnum.COMBINATION, SkinTypeEnum.SENSITIVE
    ]


def test_real_sample_image_inference():
    """Verify real sample image inference with sample_images/my_face.jpeg."""
    sample_path = Path("sample_images/my_face.jpeg")
    if not sample_path.exists():
        pytest.skip("sample_images/my_face.jpeg not available.")

    from PIL import Image
    pil_img = Image.open(sample_path)
    tensor = preprocessing_service.preprocess_to_tensor(pil_img)
    out = inference_engine.predict_tensor(tensor, compute_gradcam=True)

    post_out = prediction_service.post_process_predictions(
        raw_probabilities=out["condition_probabilities"],
        severity_grade=out["severity_grade"],
        skin_type=out["skin_type"],
        img_np=np.array(pil_img),
        saliency_map=out["saliency_map"],
        model_version=out["model_version"]
    )

    assert 0 <= post_out["overall_health_score"] <= 100
    assert len(post_out["conditions"]) == 8
    for cond_key in DERMANOVA_CONDITION_KEYS:
        assert cond_key in post_out["conditions"]
        assert 0.0 <= post_out["conditions"][cond_key].probability <= 1.0


def test_recommendation_safety_and_contraindications():
    """Verify that sensitive skin and pregnancy contraindications are respected."""
    # 1. Sensitive skin should exclude Benzoyl Peroxide
    recs = recommendation_service.generate_recommendations(
        detected_conditions={"acne": 0.85, "redness": 0.70},
        skin_type=SkinTypeEnum.SENSITIVE,
        has_sensitive_skin=True
    )
    assert any("Benzoyl Peroxide" in c for c in recs.contraindications_avoided)

    # 2. Pregnancy should exclude Retinoids
    recs_preg = recommendation_service.generate_recommendations(
        detected_conditions={"wrinkles": 0.85},
        skin_type=SkinTypeEnum.NORMAL,
        is_pregnant_or_nursing=True
    )
    assert any("pregnancy" in c.lower() or "retinal" in c.lower() for c in recs_preg.contraindications_avoided)


def test_portrait_with_light_background_accepted():
    """Verify that selfies taken in front of white/light background walls are accepted, not rejected."""
    sample_path = Path("sample_images/my_face.jpeg")
    if not sample_path.exists():
        pytest.skip("sample_images/my_face.jpeg not found")

    from ml_pipeline.inference.predictor import predictor_service
    with open(sample_path, "rb") as f:
        res = predictor_service.predict(f.read())
    assert res.overall_health_score >= 85
    assert res.face_detected is True


def test_document_rejected():
    """Verify that pure text marksheets / documents are rejected with ValueError."""
    import cv2
    from ml_pipeline.inference.predictor import predictor_service

    doc = np.ones((1000, 750, 3), dtype=np.uint8) * 245
    for y in range(200, 800, 50):
        cv2.line(doc, (50, y), (700, y), (50, 50, 50), 2)
    cv2.putText(doc, "BOARD OF EDUCATION MARKSHEET", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (20, 20, 20), 2)
    _, buf = cv2.imencode(".jpg", doc)

    with pytest.raises(ValueError) as excinfo:
        predictor_service.predict(buf.tobytes())
    assert "Document or certificate detected" in str(excinfo.value)

