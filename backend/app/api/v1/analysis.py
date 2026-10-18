import base64
import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.models.schemas import AnalysisResponse, SkinTypeEnum
from ml_pipeline.inference.predictor import predictor_service
from backend.app.database.session import get_db
from backend.app.database.models import User, SkinAssessment, PersonalizedRoutine
from backend.app.authentication.auth_handler import get_optional_user
from backend.app.services.storage import storage_service
from backend.app.services.recommender import recommender_service

router = APIRouter(prefix="/analyze", tags=["Skin Analysis"])


class Base64AnalysisPayload(BaseModel):
    image_base64: str
    skin_type_hint: Optional[str] = None


async def _save_assessment_and_routine(
    result: AnalysisResponse,
    image_bytes: bytes,
    user: Optional[User],
    db: Session
):
    """
    If user is authenticated, upload photos to Supabase Storage and
    persist assessment & personalized routine in the database.
    """
    if not user:
        return

    try:
        # 1. Upload scan and heatmap to Supabase Storage
        image_url = await storage_service.upload_scan(image_bytes, user.id)
        heatmap_url = ""
        if result.heatmap_image_base64:
            heatmap_url = await storage_service.upload_heatmap(result.heatmap_image_base64, user.id)

        # 2. Extract condition score map
        condition_prob_map = {k: v.probability for k, v in result.conditions.items()}

        # 3. Create persistent SkinAssessment record
        top_concern_str = result.top_concerns[0] if result.top_concerns else "Acne"
        assessment = SkinAssessment(
            id=result.analysis_id,
            user_id=user.id,
            overall_health_score=result.overall_health_score,
            detected_skin_type=result.detected_skin_type.value if hasattr(result.detected_skin_type, "value") else str(result.detected_skin_type),
            primary_concern=top_concern_str,
            acne_severity_grade=result.acne_severity_grade.value if hasattr(result.acne_severity_grade, "value") else str(result.acne_severity_grade),
            requires_clinical_referral=result.requires_clinical_referral,
            image_cloud_url=image_url,
            heatmap_cloud_url=heatmap_url,
            condition_scores_json=json.dumps(condition_prob_map),
            clinical_notes="AI Multi-Task Clinical Diagnosis"
        )
        db.add(assessment)
        db.flush()

        # 4. Synthesize and save personalized routine
        has_sensitive = (user.profile.has_sensitive_skin if user.profile else False) or (result.detected_skin_type == SkinTypeEnum.SENSITIVE)
        user_allergies = user.profile.get_allergies() if user.profile else []

        rec = recommender_service.generate_recommendations(
            detected_conditions=condition_prob_map,
            skin_type=result.detected_skin_type,
            has_sensitive_skin=has_sensitive,
            allergies=user_allergies
        )

        # Deactivate older routines
        db.query(PersonalizedRoutine).filter(PersonalizedRoutine.user_id == user.id).update({"is_active": False})

        new_routine = PersonalizedRoutine(
            user_id=user.id,
            assessment_id=assessment.id,
            is_active=True,
            primary_actives_json=json.dumps([a.model_dump() if hasattr(a, 'model_dump') else a.dict() for a in rec.primary_active_ingredients]),
            am_routine_json=json.dumps([s.model_dump() if hasattr(s, 'model_dump') else s.dict() for s in rec.daily_routine.morning_routine]),
            pm_routine_json=json.dumps([s.model_dump() if hasattr(s, 'model_dump') else s.dict() for s in rec.daily_routine.evening_routine]),
            dietary_guidelines_json=json.dumps(rec.dietary_guidance),
            contraindications_avoided_json=json.dumps(rec.contraindications_avoided),
            barrier_health_tips_json=json.dumps(rec.barrier_health_tips)
        )
        db.add(new_routine)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Database/Storage Warning] Failed saving user scan: {e}")


@router.post("", response_model=AnalysisResponse, summary="Analyze uploaded facial skin image")
async def analyze_image_file(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded image file (JPEG, PNG, WEBP), performs optical quality checks,
    executes multi-task 8-condition deep diagnosis, computes ordinal severity grading,
    and returns spatial Grad-CAM attention heatmaps.
    If authenticated, automatically saves to user's Supabase cloud account.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Please upload a valid JPEG, PNG, or WEBP image."
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) < 100:
            raise HTTPException(status_code=400, detail="Uploaded file is empty or corrupted.")

        result = predictor_service.predict(image_bytes)
        await _save_assessment_and_routine(result, image_bytes, current_user, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic pipeline error: {str(e)}")


@router.post("/base64", response_model=AnalysisResponse, summary="Analyze base64-encoded webcam selfie")
async def analyze_base64_image(
    payload: Base64AnalysisPayload,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Accepts a base64-encoded image string directly from the webcam canvas stream.
    If authenticated, automatically saves to user's Supabase cloud account.
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Base64 image string cannot be empty.")

    try:
        raw_b64 = payload.image_base64
        if "base64," in raw_b64:
            raw_b64 = raw_b64.split("base64,")[1]
        image_bytes = base64.b64decode(raw_b64)

        result = predictor_service.predict(payload.image_base64)
        await _save_assessment_and_routine(result, image_bytes, current_user, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic pipeline error: {str(e)}")


@router.get("/demo", response_model=AnalysisResponse, summary="Generate sample clinical demonstration analysis")
async def get_demo_analysis():
    """
    Returns an instant, complete diagnostic assessment and Grad-CAM heatmap for UI testing and presentations.
    """
    from pathlib import Path
    sample_path = Path("sample_images/my_face.jpeg")
    if sample_path.exists():
        with open(sample_path, "rb") as f:
            image_bytes = f.read()
    else:
        from PIL import Image
        import io
        buf = io.BytesIO()
        Image.new("RGB", (224, 224), color=(210, 175, 145)).save(buf, format="JPEG")
        image_bytes = buf.getvalue()

    return predictor_service.predict(image_bytes)
