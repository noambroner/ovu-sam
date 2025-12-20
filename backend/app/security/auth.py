"""
Authentication helpers for FastAPI
Provides JWT token decoding (no validation - we trust ULM)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Extract and decode JWT token WITHOUT validation.

    We trust ULM to issue valid tokens, so we just decode to read claims.
    This is the standard pattern for micro-services that trust a central auth service.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        dict: Token claims (sub, email, role, etc.)

    Raises:
        HTTPException: 401 if token is invalid or missing

    Example:
        @app.get("/protected")
        async def protected_route(current_user: dict = Depends(get_current_user)):
            user_id = current_user.get("sub")
            user_role = current_user.get("role")
            return {"user_id": user_id, "role": user_role}
    """
    token = credentials.credentials

    try:
        # Decode WITHOUT validation (trust ULM)
        claims = jwt.decode(
            token,
            options={
                "verify_signature": False,  # Don't verify signature
                "verify_exp": False,        # Don't verify expiration
            }
        )
        return claims
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


async def get_token_from_header(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Get raw token string from Authorization header.
    Useful for forwarding to ULM.

    Returns:
        str: Raw JWT token
    """
    return credentials.credentials

