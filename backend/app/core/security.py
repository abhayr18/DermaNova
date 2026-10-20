"""
DermaNova Core Security & Authentication Infrastructure
=========================================================
Implements:
1. Supabase Auth JWT token verification (using SUPABASE_JWT_SECRET if present)
2. Native application JWT issuance and verification
3. Bcrypt password hashing
4. FastAPI dependency injection for current user & ownership enforcement
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.exceptions import AuthenticationError, AuthorizationError
from backend.app.database.session import get_db
from backend.app.database.models import User

logger = logging.getLogger("dermanova.core.security")
security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash plain password using bcrypt (safely handles strings up to 72 bytes)."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Issue a signed JWT access token."""
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now_utc})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes JWT using Supabase JWT Secret if available, else Native Secret."""
    if settings.SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except Exception:
            pass

    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except Exception:
        return None


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """Enforces authentication and returns authenticated User."""
    if not auth or not auth.credentials:
        raise AuthenticationError("Authentication required. Please provide a valid Bearer token.")

    payload = decode_jwt_token(auth.credentials)
    if not payload:
        raise AuthenticationError("Invalid or expired authentication token.")

    user_id = payload.get("sub") or payload.get("user_id")
    email = payload.get("email")

    if not user_id and not email:
        raise AuthenticationError("Authentication token is missing user claims.")

    user = None
    if user_id:
        user = db.query(User).filter(User.id == str(user_id)).first()
    if not user and email:
        user = db.query(User).filter(User.email == email.lower()).first()

    # Auto-provision Supabase Auth users if verified in Supabase
    if not user and email and user_id:
        user = User(
            id=str(user_id),
            email=email.lower(),
            full_name=payload.get("user_metadata", {}).get("full_name", "Patient"),
            role="patient",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise AuthenticationError("User account not found or has been revoked.")

    return user


async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns User if valid Bearer token provided, None if guest."""
    if not auth or not auth.credentials:
        return None
    try:
        return await get_current_user(auth, db)
    except Exception:
        return None


def verify_user_ownership(resource_user_id: str, current_user: User) -> None:
    """Verifies that the current user owns the requested resource or is an admin."""
    if current_user.role == "admin":
        return
    if resource_user_id != current_user.id:
        raise AuthorizationError("You do not have permission to access or modify this record.")
