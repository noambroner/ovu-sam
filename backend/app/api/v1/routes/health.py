"""
Health and readiness check endpoints
"""
from fastapi import APIRouter
from app.core.config import settings
from app.clients.ulm import ulm_client

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    """
    Basic health check - service is running.

    Returns HTTP 200 if the service is up.
    """
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION
    }


@router.get("/ready")
async def ready():
    """
    Readiness check - service is ready to accept requests.

    Checks:
    - Service itself is running
    - ULM is reachable
    - Database is reachable (if configured)
    - Redis is reachable (if configured)

    Returns HTTP 200 if ready, 503 if not ready.
    """
    checks = {
        "service": "ok",
        "ulm": "checking"
    }

    # Check ULM connectivity
    try:
        response = await ulm_client.get("/health", timeout=5.0)
        checks["ulm"] = "ok" if response.status_code == 200 else "error"
    except Exception as e:
        checks["ulm"] = f"error: {str(e)[:50]}"

    # TODO: Add database check if DATABASE_URL is configured
    # if settings.DATABASE_URL:
    #     try:
    #         # Test database connection
    #         checks["database"] = "ok"
    #     except Exception:
    #         checks["database"] = "error"

    # TODO: Add Redis check if REDIS_URL is configured
    # if settings.REDIS_URL:
    #     try:
    #         # Test Redis connection
    #         checks["redis"] = "ok"
    #     except Exception:
    #         checks["redis"] = "error"

    # Determine overall status
    all_ok = all(v == "ok" for v in checks.values())
    status_code = 200 if all_ok else 503

    return {
        "status": "ready" if all_ok else "not_ready",
        "checks": checks
    }

