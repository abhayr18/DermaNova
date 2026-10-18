"""
DermaNova Cloud Database Engine & Session Factory
==================================================
Supports hybrid deployment:
- Production: Cloud PostgreSQL (Supabase / AWS RDS / Neon) via DATABASE_URL
- Development / Offline: Local SQLite database ('dermanova_clinical.db')
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Determine database URL
DEFAULT_SQLITE_URL = "sqlite:///./dermanova_clinical.db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

# Supabase and Heroku/Render often provide 'postgres://' URLs which SQLAlchemy 2.0 requires as 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure engine arguments based on DB driver
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
