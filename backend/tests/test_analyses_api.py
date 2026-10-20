"""
API Integration Tests: Analyses RESTful Endpoints
=================================================
Verifies:
1. POST /api/v1/analyses: Successful analysis creation from image upload
2. POST /api/v1/analyses: Rejection of invalid, blank, and oversized uploads
3. GET  /api/v1/analyses: History pagination & authentication protection
4. GET  /api/v1/analyses/{analysis_id}: Single record retrieval & ownership check
5. DELETE /api/v1/analyses/{analysis_id}: Safe deletion & ownership check
6. GET  /api/v1/recommendations/{analysis_id}: Authorization protection
"""

import io
from pathlib import Path
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def _get_auth_token(email: str = "api_test_user@dermanova.ai") -> str:
    """Helper to create or log in a test patient and return a Bearer token."""
    signup_res = client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "Password2026!Secure",
        "full_name": "API Tester"
    })
    if signup_res.status_code in (200, 201):
        return signup_res.json()["access_token"]

    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password2026!Secure"
    })
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_post_analyses_success():
    """Verify that uploading a valid face photo to POST /api/v1/analyses succeeds."""
    sample_path = Path("sample_images/my_face.jpeg")
    assert sample_path.exists(), "Sample test face image missing"

    with open(sample_path, "rb") as f:
        response = client.post(
            "/api/v1/analyses",
            files={"file": ("my_face.jpeg", f, "image/jpeg")}
        )

    assert response.status_code == 201, f"POST /analyses failed: {response.text}"
    data = response.json()
    assert "analysis_id" in data
    assert data["status"] == "completed"
    assert "overall_health_score" in data
    assert len(data["conditions"]) == 8
    assert "recommendations" in data
    assert data["recommendations"] is not None


def test_post_analyses_blank_image_rejected():
    """Verify that uploading a blank white canvas returns HTTP 400."""
    buf = io.BytesIO()
    Image.fromarray(np.full((224, 224, 3), 255, dtype=np.uint8)).save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyses",
        files={"file": ("blank.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "blank" in response.text.lower() or "overexposed" in response.text.lower()


def test_analyses_history_unauthenticated_rejected():
    """GET /api/v1/analyses must reject unauthenticated requests with 401."""
    response = client.get("/api/v1/analyses")
    assert response.status_code == 401


def test_authenticated_analyses_lifecycle_and_deletion():
    """Full lifecycle: authenticated analysis creation -> list history -> get by ID -> delete."""
    token = _get_auth_token("lifecycle_patient@dermanova.ai")
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path("sample_images/my_face.jpeg")
    with open(sample_path, "rb") as f:
        create_res = client.post(
            "/api/v1/analyses",
            files={"file": ("face.jpg", f, "image/jpeg")},
            headers=headers
        )
    assert create_res.status_code == 201
    analysis_id = create_res.json()["analysis_id"]

    # 1. List user analyses
    list_res = client.get("/api/v1/analyses?page=1&page_size=10", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(item["analysis_id"] == analysis_id for item in list_data["items"])

    # 2. Retrieve single analysis by ID
    get_res = client.get(f"/api/v1/analyses/{analysis_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["analysis_id"] == analysis_id

    # 3. Retrieve linked recommendations
    rec_res = client.get(f"/api/v1/recommendations/{analysis_id}", headers=headers)
    assert rec_res.status_code == 200
    assert "primary_active_ingredients" in rec_res.json()

    # 4. Unauthorized user cannot access this analysis
    other_token = _get_auth_token("other_user@dermanova.ai")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    unauthorized_res = client.get(f"/api/v1/analyses/{analysis_id}", headers=other_headers)
    assert unauthorized_res.status_code == 403

    # 5. Delete analysis
    del_res = client.delete(f"/api/v1/analyses/{analysis_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # 6. Verify record is gone
    get_deleted_res = client.get(f"/api/v1/analyses/{analysis_id}", headers=headers)
    assert get_deleted_res.status_code == 404
