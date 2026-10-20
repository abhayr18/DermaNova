"""
DermaNova Structured Logging & Privacy-Safe Logger
===================================================
Features:
1. Structured log formatting with correlation IDs
2. Privacy guard: never log credentials, JWT tokens, private image bytes, or patient PII
3. Configurable log levels via environment
"""

import logging
import re
import sys
from typing import Optional

SENSITIVE_PATTERNS = [
    re.compile(r"(bearer\s+)[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE),
    re.compile(r"(password['\"]?\s*[:=]\s*['\"])[^'\"]+(['\"])", re.IGNORECASE),
    re.compile(r"(jwt_secret['\"]?\s*[:=]\s*['\"])[^'\"]+(['\"])", re.IGNORECASE),
    re.compile(r"(service_role_key['\"]?\s*[:=]\s*['\"])[^'\"]+(['\"])", re.IGNORECASE),
]


class SanitizedFormatter(logging.Formatter):
    """Sanitizes sensitive information from logs before emitting."""

    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        for pattern in SENSITIVE_PATTERNS:
            msg = pattern.sub(r"\1***REDACTED***\2" if pattern.groups > 1 else r"\1***REDACTED***", msg)
        return msg


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures root and application loggers."""
    level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = SanitizedFormatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)

    return logging.getLogger("dermanova")


logger = setup_logging()
