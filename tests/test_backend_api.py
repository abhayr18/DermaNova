import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["supported_conditions"] == 8


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["services"]["ml_inference"] == "operational"


def test_model_status_endpoint():
    response = client.get("/api/v1/analyze/status")
    assert response.status_code == 200
    data = response.json()
    assert data["model_loaded"] is True
    assert data["status"] == "ready"
    assert data["supported_conditions"] == 8


def test_recommendation_endpoint():
    payload = {
        "detected_conditions": {
            "acne": 0.72,
            "blackheads": 0.65,
            "pores": 0.60,
            "dark_spots": 0.45,
            "wrinkles": 0.20,
            "redness": 0.30
        },
        "skin_type": "Oily",
        "has_sensitive_skin": False
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation_id" in data
    assert len(data["primary_active_ingredients"]) > 0
    assert len(data["curated_products"]) > 0
    assert len(data["daily_routine"]["morning_routine"]) == 4
    assert len(data["daily_routine"]["evening_routine"]) == 3


def test_recommendation_empty_conditions_rejected():
    """GAP-14 test: Recommender must reject requests with no detected conditions."""
    payload = {
        "detected_conditions": {},
        "skin_type": "Normal"
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 400
    assert "Please run a skin analysis first" in response.text


def test_history_endpoint_unauthenticated_empty():
    """GAP-03 test: Unauthenticated requests return empty records without demo data."""
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_records"] == 0
    assert data["records"] == []


def test_blank_white_image_rejected_with_400():
    """Verify that a blank white image is rejected by the gatekeeper rather than generating fake acne scores."""
    import io
    import numpy as np
    from PIL import Image

    buf = io.BytesIO()
    Image.fromarray(np.full((224, 224, 3), 255, dtype=np.uint8)).save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze",
        files={"file": ("blank_white.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "blank" in response.text or "No human face" in response.text or "Document" in response.text


