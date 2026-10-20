"""
DermaNova Common Pydantic Schemas
==================================
Reusable schemas for errors, pagination, health checks, and service metadata.
"""

from typing import Generic, TypeVar, List, Optional, Any, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorResponse(BaseModel):
    error_code: str = Field(..., description="Stable alphanumeric machine error code")
    message: str = Field(..., description="Safe, user-friendly error message")
    details: Optional[Any] = Field(None, description="Optional non-sensitive validation details")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int = Field(..., ge=0)
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class HealthStatus(BaseModel):
    status: str
    environment: str
    version: str
    services: Dict[str, str]


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    architecture: str
    input_resolution: List[int]
    device: str
    is_ready: bool
    supported_conditions: List[str]
    severity_grades: List[str]
    skin_types: List[str]
    load_error: Optional[str] = None
