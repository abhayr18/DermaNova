"""
DermaNova "Skin Journey" Longitudinal Tracking API (CureSkin Architecture)
==========================================================================
Provides:
1. Patient healing timeline (scans over 30, 60, 90 days with before/after photos)
2. Quantitative healing analytics (overall health score trajectory & condition delta)
3. Daily AM/PM routine habit tracking and compliance streaks
"""

import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, SkinAssessment, PersonalizedRoutine, SkinJourneyLog
from backend.app.authentication.auth_handler import get_current_user

router = APIRouter(prefix="/journey", tags=["Longitudinal Skin Journey"])


# ------------------ Pydantic Models ------------------

class DailyLogRequest(BaseModel):
    completed_am_routine: bool = True
    completed_pm_routine: bool = True
    applied_sunscreen: bool = True
    water_intake_liters: Optional[float] = 2.0
    barrier_comfort_rating: Optional[int] = Field(5, ge=1, le=5)
    notes: Optional[str] = ""
    checkin_photo_url: Optional[str] = None


# ------------------ Endpoints ------------------

@router.get("/timeline", summary="Get patient longitudinal scan timeline (Before & After)")
async def get_patient_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all historical skin assessment scans for the authenticated patient,
    ordered chronologically to power side-by-side before/after photo comparisons.
    """
    assessments = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.asc())
        .all()
    )

    timeline_items = []
    baseline_date = assessments[0].created_at if assessments else None

    for idx, scan in enumerate(assessments):
        days_since_start = (scan.created_at - baseline_date).days if baseline_date else 0
        phase_label = "Baseline" if idx == 0 else f"Day {days_since_start}"

        timeline_items.append({
            "assessment_id": scan.id,
            "scan_number": idx + 1,
            "phase_label": phase_label,
            "date": scan.created_at.strftime("%Y-%m-%d"),
            "health_score": scan.overall_health_score,
            "skin_type": scan.detected_skin_type,
            "primary_concern": scan.primary_concern,
            "acne_severity": scan.acne_severity_grade,
            "image_url": scan.image_cloud_url,
            "heatmap_url": scan.heatmap_cloud_url,
            "condition_scores": scan.get_condition_scores(),
            "requires_referral": scan.requires_clinical_referral
        })

    return {
        "status": "success",
        "total_scans": len(timeline_items),
        "timeline": timeline_items
    }


@router.get("/stats", summary="Get patient skin health trajectory analytics")
async def get_patient_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes CureSkin-style healing progress statistics:
    - Baseline vs Current health score delta (+X%)
    - Total scans recorded
    - Routine compliance streak
    - Primary active treatment
    """
    assessments = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.asc())
        .all()
    )

    baseline_score = assessments[0].overall_health_score if assessments else 70
    current_score = assessments[-1].overall_health_score if assessments else 70
    score_delta = current_score - baseline_score

    # Compute daily routine streak from journey logs
    journey_logs = (
        db.query(SkinJourneyLog)
        .filter(SkinJourneyLog.user_id == current_user.id)
        .order_by(SkinJourneyLog.log_date.desc())
        .all()
    )

    streak_days = len(journey_logs)  # Simplified streak counter

    # Active routine info
    active_routine = (
        db.query(PersonalizedRoutine)
        .filter(PersonalizedRoutine.user_id == current_user.id, PersonalizedRoutine.is_active == True)
        .order_by(PersonalizedRoutine.created_at.desc())
        .first()
    )

    return {
        "status": "success",
        "baseline_score": baseline_score,
        "current_score": current_score,
        "score_delta": score_delta,
        "healing_velocity": f"+{score_delta}%" if score_delta >= 0 else f"{score_delta}%",
        "total_scans": len(assessments),
        "streak_days": streak_days,
        "latest_scan_date": assessments[-1].created_at.strftime("%Y-%m-%d") if assessments else None,
        "active_routine": active_routine.to_dict() if active_routine else None
    }


@router.post("/log", summary="Log daily AM/PM routine compliance")
async def log_daily_routine(
    payload: DailyLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records daily skincare habit compliance (AM/PM routine checkoff, sunscreen usage, notes).
    Builds the user's healing habit streak.
    """
    new_log = SkinJourneyLog(
        user_id=current_user.id,
        completed_am_routine=payload.completed_am_routine,
        completed_pm_routine=payload.completed_pm_routine,
        applied_sunscreen=payload.applied_sunscreen,
        water_intake_liters=payload.water_intake_liters or 2.0,
        barrier_comfort_rating=payload.barrier_comfort_rating or 5,
        notes=payload.notes or "",
        checkin_photo_url=payload.checkin_photo_url
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "status": "logged",
        "streak_updated": True,
        "log": new_log.to_dict()
    }


@router.get("/logs", summary="Get recent routine compliance logs")
async def get_daily_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(SkinJourneyLog)
        .filter(SkinJourneyLog.user_id == current_user.id)
        .order_by(SkinJourneyLog.log_date.desc())
        .limit(30)
        .all()
    )
    return {
        "status": "success",
        "logs": [l.to_dict() for l in logs]
    }
