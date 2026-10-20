"""
DermaNova Multi-Tenant Cloud Database Schema (Supabase / PostgreSQL)
=====================================================================
Models:
1. User: Patient & Clinician accounts (UUID, role, email)
2. PatientProfile: DermaNova medical intake (skin type, sensitivity, allergies, lifestyle)
3. SkinAssessment: Longitudinal facial skin scans & 8-condition severity vectors
4. PersonalizedRoutine: Active ingredients, AM/PM regimens, and contraindications
5. SkinJourneyLog: Daily compliance check-ins, habit streaks, and healing photos
"""

import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class User(Base):
    """
    Patient or Clinician account in DermaNova.
    Can be mapped to Supabase auth.users or operated natively.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable if authenticated via Supabase OAuth
    full_name = Column(String(128), nullable=False, default="Patient")
    phone = Column(String(32), nullable=True)
    role = Column(String(32), default="patient")  # 'patient', 'dermatologist', 'admin'
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan", order_by="desc(SkinAssessment.created_at)")
    routines = relationship("PersonalizedRoutine", back_populates="user", cascade="all, delete-orphan")
    journey_logs = relationship("SkinJourneyLog", back_populates="user", cascade="all, delete-orphan", order_by="desc(SkinJourneyLog.log_date)")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "phone": self.phone,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class PatientProfile(Base):
    """
    DermaNova Medical Intake & Skin Biology Profile.
    Stores user's baseline skin characteristics, sensitivities, and lifestyle factors.
    """
    __tablename__ = "patient_profiles"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    age = Column(Integer, nullable=True)
    gender = Column(String(32), nullable=True)
    primary_skin_concern = Column(String(64), default="acne")  # 'acne', 'dark_spots', 'pigmentation', 'pores', 'wrinkles', 'redness'
    baseline_skin_type = Column(String(32), default="Normal")  # 'Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'
    has_sensitive_skin = Column(Boolean, default=False)
    known_allergies_json = Column(Text, default="[]")  # e.g. ["Fragrance", "Sulfates", "Benzoyl Peroxide"]
    
    # Lifestyle factors that influence skin barrier health
    sun_exposure_level = Column(String(32), default="moderate")  # 'low', 'moderate', 'high'
    water_intake_liters = Column(Float, default=2.0)
    sleep_hours = Column(Float, default=7.0)
    is_pregnant_or_nursing = Column(Boolean, default=False)  # Crucial for contraindicating Retinoids
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")

    def get_allergies(self) -> List[str]:
        try:
            return json.loads(self.known_allergies_json or "[]")
        except Exception:
            return []

    def set_allergies(self, allergies: List[str]):
        self.known_allergies_json = json.dumps(allergies or [])

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "age": self.age,
            "gender": self.gender,
            "primary_skin_concern": self.primary_skin_concern,
            "baseline_skin_type": self.baseline_skin_type,
            "has_sensitive_skin": self.has_sensitive_skin,
            "known_allergies": self.get_allergies(),
            "sun_exposure_level": self.sun_exposure_level,
            "water_intake_liters": self.water_intake_liters,
            "sleep_hours": self.sleep_hours,
            "is_pregnant_or_nursing": self.is_pregnant_or_nursing,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class SkinAssessment(Base):
    """
    Individual Clinical Skin Scan Record.
    Stores multi-task neural network outputs, condition vectors, and cloud image URLs.
    """
    __tablename__ = "skin_assessments"

    id = Column(String(64), primary_key=True, default=lambda: f"DN-{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    overall_health_score = Column(Integer, nullable=False)  # 0 to 100
    detected_skin_type = Column(String(32), default="Normal")
    primary_concern = Column(String(64), nullable=False)
    acne_severity_grade = Column(String(32), default="Clear / Minimal")
    requires_clinical_referral = Column(Boolean, default=False)
    
    # Cloud Storage URLs (Supabase Storage bucket: patient-scans and diagnostic-heatmaps)
    image_cloud_url = Column(String(512), nullable=True)
    heatmap_cloud_url = Column(String(512), nullable=True)
    
    # Quantitative 8-condition severity probabilities stored as JSON
    condition_scores_json = Column(Text, default="{}")
    clinical_notes = Column(Text, default="")

    # Relationships
    user = relationship("User", back_populates="assessments")
    routine = relationship("PersonalizedRoutine", back_populates="assessment", uselist=False)

    def get_condition_scores(self) -> Dict[str, Any]:
        try:
            return json.loads(self.condition_scores_json or "{}")
        except Exception:
            return {}

    def set_condition_scores(self, scores: Dict[str, Any]):
        self.condition_scores_json = json.dumps(scores or {})

    def to_dict(self):
        return {
            "assessment_id": self.id,
            "user_id": self.user_id,
            "date": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "overall_health_score": self.overall_health_score,
            "detected_skin_type": self.detected_skin_type,
            "primary_concern": self.primary_concern,
            "acne_severity_grade": self.acne_severity_grade,
            "requires_clinical_referral": self.requires_clinical_referral,
            "image_url": self.image_cloud_url,
            "heatmap_url": self.heatmap_cloud_url,
            "condition_scores": self.get_condition_scores(),
            "notes": self.clinical_notes
        }


class PersonalizedRoutine(Base):
    """
    Active Pharmacological Skincare Regimen assigned to the patient.
    Maps diagnosed skin conditions into AM/PM steps and active ingredients.
    """
    __tablename__ = "personalized_routines"

    id = Column(String(64), primary_key=True, default=lambda: f"ROUT-{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(64), ForeignKey("skin_assessments.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    primary_actives_json = Column(Text, default="[]")
    am_routine_json = Column(Text, default="[]")
    pm_routine_json = Column(Text, default="[]")
    dietary_guidelines_json = Column(Text, default="[]")
    contraindications_avoided_json = Column(Text, default="[]")
    barrier_health_tips_json = Column(Text, default="[]")

    # Relationships
    user = relationship("User", back_populates="routines")
    assessment = relationship("SkinAssessment", back_populates="routine")

    def to_dict(self):
        return {
            "routine_id": self.id,
            "user_id": self.user_id,
            "assessment_id": self.assessment_id,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "primary_active_ingredients": json.loads(self.primary_actives_json or "[]"),
            "morning_routine": json.loads(self.am_routine_json or "[]"),
            "evening_routine": json.loads(self.pm_routine_json or "[]"),
            "dietary_guidelines": json.loads(self.dietary_guidelines_json or "[]"),
            "contraindications_avoided": json.loads(self.contraindications_avoided_json or "[]"),
            "barrier_health_tips": json.loads(self.barrier_health_tips_json or "[]")
        }


class SkinJourneyLog(Base):
    """
    DermaNova Daily Habit & Longitudinal Healing Log.
    Tracks routine compliance (AM/PM checkoff), daily notes, and photo check-ins.
    """
    __tablename__ = "skin_journey_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    completed_am_routine = Column(Boolean, default=False)
    completed_pm_routine = Column(Boolean, default=False)
    applied_sunscreen = Column(Boolean, default=False)
    water_intake_liters = Column(Float, default=2.0)
    
    checkin_photo_url = Column(String(512), nullable=True)
    notes = Column(Text, default="")
    barrier_comfort_rating = Column(Integer, default=5)  # 1 to 5 scale (1: Stinging/Irritated, 5: Calmed/Hydrated)

    # Relationships
    user = relationship("User", back_populates="journey_logs")

    def to_dict(self):
        return {
            "log_id": self.id,
            "user_id": self.user_id,
            "date": self.log_date.strftime("%Y-%m-%d") if self.log_date else None,
            "completed_am_routine": self.completed_am_routine,
            "completed_pm_routine": self.completed_pm_routine,
            "applied_sunscreen": self.applied_sunscreen,
            "water_intake_liters": self.water_intake_liters,
            "checkin_photo_url": self.checkin_photo_url,
            "notes": self.notes,
            "barrier_comfort_rating": self.barrier_comfort_rating
        }
