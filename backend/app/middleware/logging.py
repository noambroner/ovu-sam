"""
Request logging middleware
Logs all requests with metadata including app_source
"""
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs all HTTP requests with timing and metadata.
    Tracks X-App-Source header to identify which frontend made the request.
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Extract metadata
        app_source = request.headers.get("x-app-source", "unknown")
        user_agent = request.headers.get("user-agent", "")

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log request
        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "app_source": app_source,
                "user_agent": user_agent[:100],  # Truncate
            }
        )

        # Add timing header
        response.headers["X-Process-Time"] = str(duration)

        return response

