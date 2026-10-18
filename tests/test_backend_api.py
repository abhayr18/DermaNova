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


def test_demo_analysis_endpoint():
    response = client.get("/api/v1/analyze/demo")
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert "overall_health_score" in data
    assert 0 <= data["overall_health_score"] <= 100
    assert "conditions" in data
    assert len(data["conditions"]) == 8
    assert "heatmap_image_base64" in data
    assert data["heatmap_image_base64"].startswith("data:image/png;base64,")


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


def test_history_endpoint():
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_records"] >= 3
