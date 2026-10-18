"""
DermaNova User Authentication & Patient Profile API
====================================================
Implements:
1. Signup & Account Registration (/api/v1/auth/signup)
2. Login & JWT Token Exchange (/api/v1/auth/login)
3. Authenticated Identity Verification (/api/v1/auth/me)
4. CureSkin-style Medical Intake Questionnaire (/api/v1/auth/profile)
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, PatientProfile
from backend.app.authentication.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["User Authentication & Profile"])


# ------------------ Pydantic Request/Response Models ------------------

class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
    user: dict


class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=100)
    gender: Optional[str] = None
    primary_skin_concern: Optional[str] = "acne"  # acne, dark_spots, pigmentation, pores, wrinkles, redness
    baseline_skin_type: Optional[str] = "Normal"  # Normal, Oily, Dry, Combination, Sensitive
    has_sensitive_skin: Optional[bool] = False
    known_allergies: Optional[List[str]] = []
    sun_exposure_level: Optional[str] = "moderate"  # low, moderate, high
    water_intake_liters: Optional[float] = 2.0
    sleep_hours: Optional[float] = 7.0
    is_pregnant_or_nursing: Optional[bool] = False


# ------------------ Endpoints ------------------

@router.post("/signup", response_model=AuthResponse, summary="Register a new patient account")
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new patient account with encrypted password storage,
    initializes their profile, and returns a session JWT.
    """
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    # Create User
    new_user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role="patient",
        is_verified=True
    )
    db.add(new_user)
    db.flush()

    # Initialize associated patient profile
    profile = PatientProfile(
        user_id=new_user.id,
        baseline_skin_type="Normal"
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    token = create_access_token(data={"sub": new_user.id, "email": new_user.email, "role": new_user.role})

    return AuthResponse(
        access_token=token,
        user=new_user.to_dict()
    )


@router.post("/login", response_model=AuthResponse, summary="Log in with email and password")
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates email and password, returning an active JWT session token.
    """
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again."
        )

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return AuthResponse(
        access_token=token,
        user=user.to_dict()
    )


@router.get("/me", summary="Get currently authenticated patient profile")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current user details, profile, and recent assessment counts.
    """
    user_data = current_user.to_dict()
    user_data["profile"] = current_user.profile.to_dict() if current_user.profile else None
    user_data["total_scans"] = len(current_user.assessments)
    return {
        "status": "success",
        "user": user_data
    }


@router.post("/profile", summary="Submit CureSkin-style Medical Intake Questionnaire")
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates patient medical intake parameters (age, skin type, allergies, lifestyle).
    Used to fine-tune pharmacological active ingredient recommendations and contraindications.
    """
    profile = current_user.profile
    if not profile:
        profile = PatientProfile(user_id=current_user.id)
        db.add(profile)

    if payload.age is not None:
        profile.age = payload.age
    if payload.gender is not None:
        profile.gender = payload.gender
    if payload.primary_skin_concern is not None:
        profile.primary_skin_concern = payload.primary_skin_concern
    if payload.baseline_skin_type is not None:
        profile.baseline_skin_type = payload.baseline_skin_type
    if payload.has_sensitive_skin is not None:
        profile.has_sensitive_skin = payload.has_sensitive_skin
    if payload.known_allergies is not None:
        profile.set_allergies(payload.known_allergies)
    if payload.sun_exposure_level is not None:
        profile.sun_exposure_level = payload.sun_exposure_level
    if payload.water_intake_liters is not None:
        profile.water_intake_liters = payload.water_intake_liters
    if payload.sleep_hours is not None:
        profile.sleep_hours = payload.sleep_hours
    if payload.is_pregnant_or_nursing is not None:
        profile.is_pregnant_or_nursing = payload.is_pregnant_or_nursing

    db.commit()
    db.refresh(profile)

    return {
        "status": "profile_updated",
        "profile": profile.to_dict()
    }


@router.get("/profile", summary="Get patient skin biology profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves the patient's baseline skin biology profile and intake answers.
    """
    if not current_user.profile:
        return {"status": "empty", "profile": None}

    return {
        "status": "success",
        "profile": current_user.profile.to_dict()
    }
