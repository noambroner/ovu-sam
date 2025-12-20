"""
Example routes demonstrating protected endpoints
"""
from fastapi import APIRouter, Depends

from app.security.auth import get_current_user
from app.core.deps import get_current_admin_user

router = APIRouter(prefix="/example", tags=["Example"])


@router.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    """
    Example of a protected route that requires authentication.

    The current_user dependency automatically validates the JWT token.
    If the token is missing or invalid, FastAPI returns 401 Unauthorized.

    **Returns:**
    - Message and user information from token
    """
    return {
        "message": "This is a protected route",
        "user_id": current_user.get("sub"),
        "user_email": current_user.get("email"),
        "user_role": current_user.get("role")
    }


@router.get("/admin-only")
async def admin_only_route(admin_user: dict = Depends(get_current_admin_user)):
    """
    Example of an admin-only route.

    Requires authentication + admin role.
    Returns 403 Forbidden if user is not an admin.

    **Returns:**
    - Message and admin information
    """
    return {
        "message": "This is an admin-only route",
        "admin_id": admin_user.get("sub"),
        "admin_email": admin_user.get("email"),
        "admin_role": admin_user.get("role")
    }


@router.get("/public")
async def public_route():
    """
    Example of a public route that doesn't require authentication.

    Anyone can access this endpoint.

    **Returns:**
    - Public message
    """
    return {
        "message": "This is a public route, no authentication required"
    }

