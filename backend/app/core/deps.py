"""
Common dependencies for FastAPI routes
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from app.security.auth import get_current_user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to get current active user.
    Add additional checks here if needed (e.g., is_active flag).
    """
    return current_user


async def get_current_admin_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to get current user with admin role.
    """
    role = current_user.get("role", "user")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    return current_user

