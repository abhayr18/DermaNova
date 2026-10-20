"""
DermaNova Request Rate Limiter (GAP-08)
========================================
Thread-safe sliding-window rate limiter dependency for high-load and sensitive endpoints.
Protects ML inference from CPU exhaustion and auth endpoints from brute-force attacks.
"""

import os
import time
from collections import defaultdict
from threading import Lock
from fastapi import Request, HTTPException, status


class RateLimiter:
    def __init__(self, requests_per_minute: int, endpoint_name: str = "endpoint"):
        self.rpm = requests_per_minute
        self.endpoint_name = endpoint_name
        self.window = 60.0  # 60 seconds
        self.requests = defaultdict(list)
        self.lock = Lock()

    async def __call__(self, request: Request):
        # Skip rate limiting in automated test runs
        if os.getenv("TESTING", "False").lower() == "true":
            return

        client_ip = request.client.host if request.client else "unknown"
        # Forwarded for header in case behind reverse proxy
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        now = time.time()
        with self.lock:
            # Clean entries outside current window
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] if now - t < self.window
            ]
            if len(self.requests[client_ip]) >= self.rpm:
                retry_after = int(self.window - (now - self.requests[client_ip][0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"Rate limit exceeded for {self.endpoint_name}. "
                        f"Maximum {self.rpm} requests per minute allowed. "
                        f"Please retry after {max(1, retry_after)} seconds."
                    ),
                    headers={"Retry-After": str(max(1, retry_after))}
                )
            self.requests[client_ip].append(now)


# Standard rate limiters
analyze_limiter = RateLimiter(requests_per_minute=10, endpoint_name="diagnostic analysis")
login_limiter = RateLimiter(requests_per_minute=10, endpoint_name="user login")
signup_limiter = RateLimiter(requests_per_minute=5, endpoint_name="account signup")
password_reset_limiter = RateLimiter(requests_per_minute=3, endpoint_name="password recovery")
