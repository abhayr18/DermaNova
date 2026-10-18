"""
DermaNova End-to-End Clinical System Integration Test
======================================================
Tests the entire lifecycle:
1. Optical Image Ingestion & Face Detection (/api/v1/analyze)
2. Saliency Heatmap Generation (Grad-CAM PNG Base64)
3. Multi-label 8-condition diagnostics and selective abstain logic
4. Pharmacological Recommendation Synthesis (/api/v1/recommend)
5. Persistent Database History Storage & Retrieval (/api/v1/history)
"""

import base64
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_full_diagnostic_and_history_lifecycle():
    sample_img_path = Path("sample_images/my_face.jpeg")
    assert sample_img_path.exists(), "Sample test face image missing"

    # Step 1: Upload real image file to /api/v1/analyze
    with open(sample_img_path, "rb") as f:
        response = client.post(
            "/api/v1/analyze",
            files={"file": ("my_face.jpeg", f, "image/jpeg")}
        )

    assert response.status_code == 200, f"Analysis failed: {response.text}"
    analysis_data = response.json()

    # Verify diagnostic schema fields
    assert "analysis_id" in analysis_data
    assert analysis_data["analysis_id"].startswith("DN-")
    assert 0 <= analysis_data["overall_health_score"] <= 100
    assert analysis_data["detected_skin_type"] in ["Normal", "Oily", "Dry", "Combination", "Sensitive"]
    assert len(analysis_data["conditions"]) == 8

    # Verify all 8 core dermatological conditions are present
    expected_conditions = [
        "acne", "blackheads", "whiteheads", "dark_spots",
        "pigmentation", "pores", "wrinkles", "redness"
    ]
    for cond in expected_conditions:
        assert cond in analysis_data["conditions"], f"Missing condition {cond}"
        score_obj = analysis_data["conditions"][cond]
        assert 0.0 <= score_obj["probability"] <= 1.0
        assert score_obj["severity_level"] in ["Clear / Minimal", "Mild", "Moderate", "Severe"]

    # Verify Saliency / Grad-CAM heatmap
    assert "heatmap_image_base64" in analysis_data
    assert analysis_data["heatmap_image_base64"].startswith("data:image/png;base64,")

    # Step 2: Request Pharmacological Recommendations based on diagnosed conditions
    condition_prob_map = {k: v["probability"] for k, v in analysis_data["conditions"].items()}
    rec_payload = {
        "analysis_id": analysis_data["analysis_id"],
        "detected_conditions": condition_prob_map,
        "skin_type": analysis_data["detected_skin_type"],
        "has_sensitive_skin": (analysis_data["detected_skin_type"] == "Sensitive"),
        "allergies": []
    }

    rec_response = client.post("/api/v1/recommend", json=rec_payload)
    assert rec_response.status_code == 200
    rec_data = rec_response.json()

    assert "primary_active_ingredients" in rec_data
    assert len(rec_data["primary_active_ingredients"]) > 0
    assert "daily_routine" in rec_data
    assert len(rec_data["daily_routine"]["morning_routine"]) > 0
    assert len(rec_data["daily_routine"]["evening_routine"]) > 0

    # Step 3: Persist Assessment to Longitudinal History
    save_payload = {
        "analysis_id": analysis_data["analysis_id"],
        "overall_health_score": analysis_data["overall_health_score"],
        "top_concern": analysis_data["top_concerns"][0] if analysis_data["top_concerns"] else "Acne",
        "acne_severity_grade": analysis_data["acne_severity_grade"],
        "skin_type": analysis_data["detected_skin_type"],
        "notes": "Automated End-to-End Validation Run",
        "condition_scores": condition_prob_map,
        "recommended_actives": [ing["name"] for ing in rec_data["primary_active_ingredients"]]
    }

    save_response = client.post("/api/v1/history/save", json=save_payload)
    assert save_response.status_code == 200
    saved_data = save_response.json()
    assert saved_data["status"] == "saved"
    record_id = saved_data["record"]["record_id"]

    # Step 4: Verify Database Retrieval
    history_response = client.get("/api/v1/history")
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert history_data["status"] == "success"
    assert history_data["total_records"] >= 1

    matching_records = [r for r in history_data["records"] if r["record_id"] == record_id]
    assert len(matching_records) == 1, "Saved record must be retrievable from persistent database"
    assert matching_records[0]["health_score"] == analysis_data["overall_health_score"]


def test_base64_webcam_analysis_endpoint():
    sample_img_path = Path("sample_images/my_face.jpeg")
    with open(sample_img_path, "rb") as f:
        b64_str = base64.b64encode(f.read()).decode("ascii")

    payload = {"image_base64": f"data:image/jpeg;base64,{b64_str}"}
    response = client.post("/api/v1/analyze/base64", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["face_detected"] is True
    assert len(data["conditions"]) == 8
    assert data["overall_health_score"] >= 0
