"""
DermaNova Cloud Authentication & JWT Security Handler
======================================================
Supports:
1. Supabase Auth JWT Token verification (via Supabase JWT secret / claims)
2. Native FastAPI JWT issuance & Argon2/Bcrypt password hashing
3. FastAPI Dependencies for Protected Endpoints:
   - get_current_user: Enforces authenticated user session
   - get_optional_user: Allows dual-mode (guest demo vs authenticated patient)
"""

import time
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.database.models import User, PatientProfile

import bcrypt

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Generate secure bcrypt password hash (truncated to 72 bytes per bcrypt standard)."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Issue a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT token.
    First tries Supabase JWT Secret (if configured), then falls back to Native JWT Secret.
    """
    # 1. Try Supabase JWT Secret if available
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except Exception:
            pass

    # 2. Try Native JWT Secret
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except Exception:
        return None


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that enforces authentication.
    Returns the authenticated User database record.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_jwt_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Supabase uses 'sub' for user ID; native tokens store 'user_id' or 'sub'
    user_id = payload.get("sub") or payload.get("user_id")
    email = payload.get("email")

    if not user_id and not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing user identification.",
        )

    # Lookup user in database
    user = None
    if user_id:
        user = db.query(User).filter(User.id == str(user_id)).first()
    if not user and email:
        user = db.query(User).filter(User.email == email.lower()).first()

    # Auto-provision Supabase user in local DB if authenticated via Supabase Auth
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been revoked.",
        )

    return user


async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional user dependency: returns User if authenticated, None if guest.
    Used for public scan endpoints that can optionally save to a profile.
    """
    if not auth or not auth.credentials:
        return None

    try:
        return await get_current_user(auth, db)
    except Exception:
        return None
