"""
Unit and Integration Tests: Health & Model Metadata Endpoints
==============================================================
Tests:
1. GET /api/v1/health returns 200 and operational service status
2. Root /health returns 200
3. GET /api/v1/model-info returns 200 and safe metadata
4. Model ready status is properly reflected
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_v1_health_check_operational():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["services"]["database"] == "operational"
    assert data["services"]["ml_inference"] == "operational"
    assert "version" in data


def test_root_health_check_alias():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["services"]["ml_inference"] == "operational"


def test_model_info_endpoint():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "DermaNova Multi-Task EfficientNet"
    assert data["architecture"] == "efficientnet_b0"
    assert data["input_resolution"] == [224, 224]
    assert data["is_ready"] is True
    assert len(data["supported_conditions"]) == 8
    assert "acne" in data["supported_conditions"]
    assert "redness" in data["supported_conditions"]
    assert len(data["severity_grades"]) == 3
    assert len(data["skin_types"]) == 5
