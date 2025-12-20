"""
HTTP client helpers for calling ULM with user/service credentials.

This module provides a configured httpx client for making requests to ULM,
including automatic X-App-Source header injection and service token management.
"""
from typing import Dict, Any, Optional
import asyncio
import time

import httpx

from app.core.config import settings

# Single shared client for all ULM requests
# Will be closed during app shutdown (see main.py lifespan)
client = httpx.AsyncClient(
    base_url=settings.ULM_SERVICE_URL,
    timeout=30.0,
    headers={
        # Identifies this service in ULM logs
        "X-App-Source": settings.ULM_SERVICE_APP_SOURCE,
        # Kept for backwards compatibility
        "X-Service": settings.ULM_SERVICE_APP_SOURCE,
    },
)

# Simple in-process cache for service token (token, expires_at)
_service_token_cache: Dict[str, Any] = {"token": None, "exp": 0.0}
_service_token_lock = asyncio.Lock()


async def get_service_token() -> Optional[str]:
    """
    Retrieve a service token using service credentials, if configured.

    Expected env: ULM_SERVICE_USERNAME / ULM_SERVICE_PASSWORD

    Returns:
        Service access token or None if credentials not configured
    """
    if not settings.ULM_SERVICE_USERNAME or not settings.ULM_SERVICE_PASSWORD:
        return None

    async with _service_token_lock:
        now = time.time()
        token = _service_token_cache.get("token")
        exp = _service_token_cache.get("exp", 0.0)

        # Return cached token if still valid (with 30s buffer)
        if token and exp > now + 30:
            return token

        # Fetch new token
        resp = await client.post(
            "/api/v1/auth/login",
            json={
                "username": settings.ULM_SERVICE_USERNAME,
                "password": settings.ULM_SERVICE_PASSWORD,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        access_token = data.get("access_token")
        expires_in = data.get("expires_in") or 60 * 10  # fallback 10 minutes

        _service_token_cache["token"] = access_token
        _service_token_cache["exp"] = now + expires_in
        return access_token


async def ulm_request(
    method: str,
    path: str,
    *,
    user_token: Optional[str] = None,
    use_service_fallback: bool = False,
    **kwargs: Any,
) -> httpx.Response:
    """
    Perform a request to ULM, forwarding the user Authorization header when provided.
    Optionally fall back to a service token for system actions.

    Args:
        method: HTTP method (GET, POST, etc.)
        path: API path (e.g., '/api/v1/users')
        user_token: User's bearer token (will be forwarded)
        use_service_fallback: If True and no user_token, use service token
        **kwargs: Additional httpx request parameters

    Returns:
        httpx.Response object

    Example:
        # Forward user request
        response = await ulm_request(
            "GET",
            "/api/v1/users/me",
            user_token=request.headers.get("authorization")
        )

        # System request with service token
        response = await ulm_request(
            "POST",
            "/api/v1/users",
            use_service_fallback=True,
            json={"email": "user@example.com"}
        )
    """
    headers = kwargs.pop("headers", {})

    # Add user token if provided
    if user_token:
        # Remove 'Bearer ' prefix if present
        token = user_token.replace("Bearer ", "") if user_token.startswith("Bearer ") else user_token
        headers["Authorization"] = f"Bearer {token}"
    elif use_service_fallback:
        # Use service token for system operations
        service_token = await get_service_token()
        if service_token:
            headers["Authorization"] = f"Bearer {service_token}"

    # Ensure X-App-Source is always sent
    headers.setdefault("X-App-Source", settings.ULM_SERVICE_APP_SOURCE)
    headers.setdefault("X-Service", settings.ULM_SERVICE_APP_SOURCE)

    return await client.request(method, path, headers=headers, **kwargs)


# Alias for backwards compatibility
ulm_client = client

