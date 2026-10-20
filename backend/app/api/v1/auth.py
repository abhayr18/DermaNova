"""
DermaNova User Authentication & Patient Profile API
====================================================
Implements:
1. Signup & Account Registration (/api/v1/auth/signup)
2. Login & JWT Token Exchange (/api/v1/auth/login)
3. Authenticated Identity Verification (/api/v1/auth/me)
4. DermaNova Medical Intake Questionnaire (/api/v1/auth/profile)
"""

from datetime import timedelta
import logging
import re
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.database.models import User, PatientProfile
from backend.app.authentication.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    decode_jwt_token,
    get_current_user
)
from backend.app.core.rate_limiter import (
    signup_limiter,
    login_limiter,
    password_reset_limiter
)

logger = logging.getLogger("dermanova.auth")

router = APIRouter(prefix="/auth", tags=["User Authentication & Profile"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


# ------------------ Pydantic Request/Response Models ------------------

class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=32)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format.")
        return clean


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format.")
        return clean


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format.")
        return clean


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class AuthResponse(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
    user: dict


class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=100)
    gender: Optional[str] = Field(None, max_length=32)
    primary_skin_concern: Optional[str] = Field("acne", max_length=64)
    baseline_skin_type: Optional[str] = Field("Normal", max_length=32)
    has_sensitive_skin: Optional[bool] = False
    known_allergies: Optional[List[str]] = []
    sun_exposure_level: Optional[str] = Field("moderate", max_length=32)
    water_intake_liters: Optional[float] = Field(2.0, ge=0.0, le=10.0)
    sleep_hours: Optional[float] = Field(7.0, ge=0.0, le=24.0)
    is_pregnant_or_nursing: Optional[bool] = False


# ------------------ Endpoints ------------------

@router.post(
    "/signup",
    response_model=AuthResponse,
    summary="Register a new patient account",
    dependencies=[Depends(signup_limiter)]
)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new patient account with encrypted password storage,
    initializes their profile, and returns a session JWT.
    Rate-limited to prevent automated spam registrations.
    """
    normalized_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )

    # Create User
    new_user = User(
        email=normalized_email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
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

    logger.info(f"New patient account registered: {new_user.id}")

    # Issue JWT token
    token = create_access_token(data={"sub": new_user.id, "email": new_user.email, "role": new_user.role})

    return AuthResponse(
        access_token=token,
        user=new_user.to_dict()
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Log in with email and password",
    dependencies=[Depends(login_limiter)]
)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates email and password, returning an active JWT session token.
    Rate-limited to prevent brute-force attacks.
    """
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        logger.warning(f"Failed login attempt for {normalized_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again."
        )

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return AuthResponse(
        access_token=token,
        user=user.to_dict()
    )


@router.post(
    "/forgot-password",
    summary="Request a password recovery token",
    dependencies=[Depends(password_reset_limiter)]
)
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates account password recovery.
    Issues a short-lived password reset token (15 min) for the account.
    """
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    # Always return a generic success message to prevent user enumeration
    if not user:
        return {
            "status": "success",
            "message": "If an account with that email exists, password reset instructions have been generated."
        }

    reset_token = create_access_token(
        data={"sub": user.id, "purpose": "password_reset", "email": user.email},
        expires_delta=timedelta(minutes=15)
    )

    logger.info(f"Password reset token issued for user {user.id}")
    return {
        "status": "success",
        "message": "Password reset token generated successfully. Valid for 15 minutes.",
        "reset_token": reset_token
    }


@router.post(
    "/reset-password",
    summary="Reset password using a valid reset token",
    dependencies=[Depends(password_reset_limiter)]
)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates a password reset token and updates the user's password hash.
    """
    token_data = decode_jwt_token(payload.token)
    if not token_data or token_data.get("purpose") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or malformed password reset token."
        )

    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token no longer exists."
        )

    user.password_hash = hash_password(payload.new_password)
    db.commit()

    logger.info(f"Password reset successfully completed for user {user.id}")
    return {
        "status": "success",
        "message": "Your password has been reset successfully. You can now log in with your new credentials."
    }


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


@router.post("/profile", summary="Submit DermaNova Medical Intake Questionnaire")
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
