"""
DermaNova Longitudinal Skin Tracking History API
=================================================
Connects to persistent database (Supabase / PostgreSQL / SQLite) to record and track
patient skin health trajectories and treatment responses over time.
Supports both user-scoped queries and demo benchmarks.
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database.session import get_db, Base, engine
from backend.app.database.models import User, SkinAssessment, PatientProfile
from backend.app.authentication.auth_handler import get_optional_user

# Initialize tables
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/history", tags=["Longitudinal Tracking"])


class SaveHistoryRequest(BaseModel):
    analysis_id: Optional[str] = None
    overall_health_score: int
    top_concern: str
    acne_severity_grade: str
    skin_type: Optional[str] = "Normal"
    notes: Optional[str] = ""
    condition_scores: Optional[Dict[str, float]] = None
    recommended_actives: Optional[List[str]] = None


def _seed_initial_benchmarks(db: Session, demo_user_id: str = "DEMO-USER-001"):
    """Seed baseline clinical history records if database is empty."""
    demo_user = db.query(User).filter(User.id == demo_user_id).first()
    if not demo_user:
        demo_user = User(
            id=demo_user_id,
            email="demo.patient@dermanova.app",
            full_name="Demo Clinical Patient",
            role="patient",
            is_verified=True
        )
        db.add(demo_user)
        db.commit()

    if db.query(SkinAssessment).filter(SkinAssessment.user_id == demo_user_id).count() == 0:
        now = datetime.utcnow()
        benchmarks = [
            SkinAssessment(
                id="DN-HIST-001",
                user_id=demo_user_id,
                created_at=now - timedelta(days=45),
                overall_health_score=68,
                detected_skin_type="Oily",
                primary_concern="Inflammatory Acne",
                acne_severity_grade="Moderate",
                clinical_notes="Initial consultation; prescribed Azelaic Acid 10% and BHA Cleanser.",
                condition_scores_json=json.dumps({"acne": 0.68, "pores": 0.55, "redness": 0.40})
            ),
            SkinAssessment(
                id="DN-HIST-002",
                user_id=demo_user_id,
                created_at=now - timedelta(days=21),
                overall_health_score=75,
                detected_skin_type="Combination",
                primary_concern="Post-Acne Dark Spots",
                acne_severity_grade="Mild",
                clinical_notes="Papules reduced by 60%; introducing Tranexamic Acid and Cica barrier cream.",
                condition_scores_json=json.dumps({"acne": 0.35, "dark_spots": 0.52, "redness": 0.28})
            ),
            SkinAssessment(
                id="DN-HIST-003",
                user_id=demo_user_id,
                created_at=now - timedelta(days=5),
                overall_health_score=84,
                detected_skin_type="Combination",
                primary_concern="Dilated Pores",
                acne_severity_grade="Mild",
                clinical_notes="Substantial barrier improvement; continuing Niacinamide maintenance.",
                condition_scores_json=json.dumps({"pores": 0.42, "acne": 0.18, "dark_spots": 0.25})
            ),
        ]
        db.add_all(benchmarks)
        db.commit()


@router.get("", summary="Get longitudinal skin tracking history")
async def get_history_records(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical skin assessment records ordered chronologically.
    If authenticated, returns the patient's individual scans.
    If guest, returns demo baseline benchmarks.
    """
    _seed_initial_benchmarks(db)

    user_id_to_query = current_user.id if current_user else "DEMO-USER-001"
    records = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == user_id_to_query)
        .order_by(SkinAssessment.created_at.asc())
        .all()
    )

    record_dicts = []
    for r in records:
        record_dicts.append({
            "record_id": r.id,
            "date": r.created_at.strftime("%Y-%m-%d") if r.created_at else datetime.utcnow().strftime("%Y-%m-%d"),
            "health_score": r.overall_health_score,
            "skin_type": r.detected_skin_type,
            "primary_concern": r.primary_concern,
            "severity": r.acne_severity_grade,
            "notes": r.clinical_notes or "AI Diagnostic Skin Assessment",
            "image_url": r.image_cloud_url,
            "heatmap_url": r.heatmap_cloud_url
        })

    return {
        "status": "success",
        "total_records": len(record_dicts),
        "records": record_dicts
    }


@router.post("/save", summary="Save new analysis result to history")
async def save_history_record(
    payload: SaveHistoryRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Appends a new skin assessment result into the persistent database.
    """
    user_id = current_user.id if current_user else "DEMO-USER-001"
    rec_id = payload.analysis_id or f"DN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    new_record = SkinAssessment(
        id=rec_id,
        user_id=user_id,
        overall_health_score=payload.overall_health_score,
        detected_skin_type=payload.skin_type or "Normal",
        primary_concern=payload.top_concern,
        acne_severity_grade=payload.acne_severity_grade,
        clinical_notes=payload.notes or "Automated DermaNova AI analysis check-in.",
        condition_scores_json=json.dumps(payload.condition_scores or {})
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {
        "status": "saved",
        "record": {
            "record_id": new_record.id,
            "date": new_record.created_at.strftime("%Y-%m-%d"),
            "health_score": new_record.overall_health_score,
            "skin_type": new_record.detected_skin_type,
            "primary_concern": new_record.primary_concern,
            "severity": new_record.acne_severity_grade,
            "notes": new_record.clinical_notes
        }
    }
