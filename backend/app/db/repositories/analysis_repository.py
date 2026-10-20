"""
DermaNova Analysis Repository
==============================
Handles database CRUD operations for patient skin assessments and personalized routines.
Strictly enforces ownership checks on all user queries.
"""

import json
import logging
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.models import SkinAssessment, PersonalizedRoutine, User
from backend.app.core.exceptions import ResourceNotFoundError, AuthorizationError

logger = logging.getLogger("dermanova.repositories.analysis")


class AnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        assessment_id: str,
        user_id: str,
        overall_health_score: int,
        detected_skin_type: str,
        primary_concern: str,
        acne_severity_grade: str,
        requires_clinical_referral: bool,
        image_cloud_url: Optional[str],
        heatmap_cloud_url: Optional[str],
        condition_scores: Dict[str, float],
        clinical_notes: str = "AI Multi-Task Clinical Diagnosis"
    ) -> SkinAssessment:
        """Creates and persists a new SkinAssessment record."""
        assessment = SkinAssessment(
            id=assessment_id,
            user_id=user_id,
            overall_health_score=overall_health_score,
            detected_skin_type=detected_skin_type,
            primary_concern=primary_concern,
            acne_severity_grade=acne_severity_grade,
            requires_clinical_referral=requires_clinical_referral,
            image_cloud_url=image_cloud_url,
            heatmap_cloud_url=heatmap_cloud_url,
            condition_scores_json=json.dumps(condition_scores),
            clinical_notes=clinical_notes
        )
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_by_id_and_user(self, assessment_id: str, user_id: str) -> Optional[SkinAssessment]:
        """Retrieves a single assessment verifying that it belongs to the requesting user."""
        record = self.db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
        if not record:
            return None
        if record.user_id != user_id:
            raise AuthorizationError("You do not have permission to view this analysis.")
        return record

    def list_by_user(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[SkinAssessment], int]:
        """Returns paginated assessment records for a user ordered by created_at desc."""
        query = self.db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id)
        total = query.count()
        offset = (page - 1) * page_size
        items = query.order_by(desc(SkinAssessment.created_at)).offset(offset).limit(page_size).all()
        return items, total

    def delete(self, assessment_id: str, user_id: str) -> SkinAssessment:
        """Deletes an assessment record verifying user ownership."""
        record = self.db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
        if not record:
            raise ResourceNotFoundError(f"Analysis with ID '{assessment_id}' not found.")
        if record.user_id != user_id:
            raise AuthorizationError("You do not have permission to delete this analysis.")

        # Delete any associated routines
        self.db.query(PersonalizedRoutine).filter(PersonalizedRoutine.assessment_id == assessment_id).delete()

        self.db.delete(record)
        self.db.commit()
        return record
