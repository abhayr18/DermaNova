"""
DermaNova Custom Application Exceptions & Error Handlers
=========================================================
Provides consistent, production-safe HTTP error formatting:
{
    "error_code": "STRING_IDENTIFIER",
    "message": "Human-readable user-friendly message",
    "details": null | {}
}
"""

from typing import Optional, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


class DermaNovaBaseException(Exception):
    def __init__(
        self,
        error_code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details


class ImageValidationError(DermaNovaBaseException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            error_code="INVALID_IMAGE_FILE",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class ImageTooLargeError(DermaNovaBaseException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            error_code="IMAGE_TOO_LARGE",
            message=message,
            status_code=getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413),
            details=details
        )



class ImageQualityError(DermaNovaBaseException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            error_code="IMAGE_UNSUITABLE_FOR_ANALYSIS",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class ModelUnavailableError(DermaNovaBaseException):
    def __init__(self, message: str = "ML diagnostic engine is temporarily unavailable."):
        super().__init__(
            error_code="MODEL_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class AuthenticationError(DermaNovaBaseException):
    def __init__(self, message: str = "Authentication required or invalid credentials."):
        super().__init__(
            error_code="AUTHENTICATION_FAILED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AuthorizationError(DermaNovaBaseException):
    def __init__(self, message: str = "You do not have permission to access this resource."):
        super().__init__(
            error_code="ACCESS_FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )


class ResourceNotFoundError(DermaNovaBaseException):
    def __init__(self, message: str = "Requested resource not found."):
        super().__init__(
            error_code="RESOURCE_NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )


class RateLimitExceededError(DermaNovaBaseException):
    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(
            error_code="RATE_LIMIT_EXCEEDED",
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )


async def dermanova_exception_handler(request: Request, exc: DermaNovaBaseException) -> JSONResponse:
    """Handles all DermaNova domain exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles FastAPI Pydantic request validation errors without exposing internal stack traces."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid parameter")
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error_code": "REQUEST_VALIDATION_ERROR",
            "message": "The submitted request failed schema validation.",
            "details": errors
        }
    )
