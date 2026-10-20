"""
DermaNova Cloud Architecture Test Suite
========================================
Verifies:
1. Patient registration & JWT issuance
2. Medical Intake Questionnaire (skin type, allergies, lifestyle)
3. Authenticated diagnostic scan with automatic routine assignment
4. Longitudinal "Skin Journey" timeline & healing stats
5. Daily routine habit compliance logging
"""

import base64
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_dermanova_full_patient_lifecycle():
    # 1. Signup a new patient
    signup_payload = {
        "email": "patient.test@dermanova.app",
        "password": "SecurePassword123!",
        "full_name": "Priya Sharma",
        "phone": "+91 9876543210"
    }
    signup_res = client.post("/api/v1/auth/signup", json=signup_payload)
    if signup_res.status_code == 400:
        # If already exists from previous test run, log in
        login_res = client.post("/api/v1/auth/login", json={
            "email": signup_payload["email"],
            "password": signup_payload["password"]
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
    else:
        assert signup_res.status_code == 200
        token = signup_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Complete Medical Intake Questionnaire
    profile_payload = {
        "age": 24,
        "gender": "Female",
        "primary_skin_concern": "acne",
        "baseline_skin_type": "Combination",
        "has_sensitive_skin": True,
        "known_allergies": ["Fragrance", "High-strength AHA"],
        "sun_exposure_level": "moderate",
        "water_intake_liters": 2.5,
        "sleep_hours": 8.0,
        "is_pregnant_or_nursing": False
    }
    profile_res = client.post("/api/v1/auth/profile", json=profile_payload, headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.json()["profile"]
    assert profile_data["primary_skin_concern"] == "acne"
    assert profile_data["has_sensitive_skin"] is True
    assert "Fragrance" in profile_data["known_allergies"]

    # 3. Perform an authenticated facial skin scan
    sample_img_path = Path("sample_images/my_face.jpeg")
    if sample_img_path.exists():
        with open(sample_img_path, "rb") as f:
            b64_str = base64.b64encode(f.read()).decode("ascii")
        img_payload = f"data:image/jpeg;base64,{b64_str}"
    else:
        # Synthetic patch
        img_payload = "data:image/jpeg;base64," + base64.b64encode(b"SyntheticFaceImageBytes" * 40).decode("ascii")

    scan_res = client.post("/api/v1/analyze/base64", json={"image_base64": img_payload}, headers=headers)
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert "analysis_id" in scan_data
    assert len(scan_data["conditions"]) == 8

    # 4. Check that the scan appeared in the patient's "Skin Journey" timeline
    timeline_res = client.get("/api/v1/journey/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    assert timeline_data["total_scans"] >= 1
    latest_scan = timeline_data["timeline"][-1]
    assert latest_scan["assessment_id"] == scan_data["analysis_id"]

    # 5. Check healing stats & active routine
    stats_res = client.get("/api/v1/journey/stats", headers=headers)
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert "healing_velocity" in stats_data
    assert stats_data["active_routine"] is not None
    assert len(stats_data["active_routine"]["morning_routine"]) > 0

    # 6. Log daily routine compliance
    log_payload = {
        "completed_am_routine": True,
        "completed_pm_routine": True,
        "applied_sunscreen": True,
        "water_intake_liters": 3.0,
        "barrier_comfort_rating": 5,
        "notes": "Skin feels hydrated. No redness after applying Azelaic acid."
    }
    log_res = client.post("/api/v1/journey/log", json=log_payload, headers=headers)
    assert log_res.status_code == 200
    assert log_res.json()["status"] == "logged"
