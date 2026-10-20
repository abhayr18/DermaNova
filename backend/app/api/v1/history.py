"""
DermaNova Longitudinal Skin Tracking History API
=================================================
Connects to persistent database (Supabase / PostgreSQL / SQLite) to record and track
patient skin health trajectories and treatment responses over time.
"""

import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, SkinAssessment
from backend.app.authentication.auth_handler import get_optional_user, get_current_user

logger = logging.getLogger("dermanova.history")

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


@router.get("", summary="Get longitudinal skin tracking history")
async def get_history_records(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical skin assessment records ordered chronologically.
    If authenticated, returns the patient's individual scans.
    If guest, returns empty results (login required for historical tracking).
    """
    if not current_user:
        return {
            "status": "success",
            "total_records": 0,
            "records": [],
            "message": "Login required to view skin tracking history."
        }

    records = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.asc())
        .all()
    )

    record_dicts = []
    for r in records:
        record_dicts.append({
            "record_id": r.id,
            "date": r.created_at.strftime("%Y-%m-%d") if r.created_at else datetime.now(timezone.utc).strftime("%Y-%m-%d"),
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Appends a new skin assessment result into the persistent database.
    Requires authentication — no anonymous saves allowed.
    """
    rec_id = payload.analysis_id or f"DN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

    new_record = SkinAssessment(
        id=rec_id,
        user_id=current_user.id,
        overall_health_score=payload.overall_health_score,
        detected_skin_type=payload.skin_type or "Normal",
        primary_concern=payload.top_concern,
        acne_severity_grade=payload.acne_severity_grade,
        clinical_notes=payload.notes or "AI Diagnostic Skin Assessment",
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
