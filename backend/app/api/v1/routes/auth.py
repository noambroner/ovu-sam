"""
Authentication routes for sam service
Proxies authentication requests to ULM
"""
from fastapi import APIRouter, HTTPException, Depends

from app.clients.ulm import ulm_client
from app.security.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
async def login(payload: dict):
    """
    Proxy login request to ULM and return its response.

    **Request Body:**
    - username: User's username or email
    - password: User's password

    **Returns:**
    - access_token: JWT access token
    - refresh_token: JWT refresh token
    - token_type: "bearer"
    - expires_in: Token expiration time in seconds
    - user: Optional user details

    **Example:**
    ```json
    {
      "username": "user@example.com",
      "password": "password123"
    }
    ```
    """
    response = await ulm_client.post("/api/v1/auth/login", json=payload)
    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json()
        )
    return response.json()


@router.post("/refresh")
async def refresh(payload: dict):
    """
    Refresh access token using refresh token.

    **Request Body:**
    - refresh_token: Valid refresh token

    **Returns:**
    - access_token: New JWT access token
    - refresh_token: New refresh token (or same one)
    - token_type: "bearer"
    - expires_in: Token expiration time in seconds
    """
    response = await ulm_client.post("/api/v1/auth/refresh", json=payload)
    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json()
        )
    return response.json()


@router.get("/me")
async def auth_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information from token claims.

    **Returns:**
    - User details from JWT token (sub, email, role, etc.)

    **Example Response:**
    ```json
    {
      "sub": "123",
      "email": "user@example.com",
      "role": "user"
    }
    ```
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout current user.

    Note: Since we're using stateless JWT, logout is primarily client-side.
    The client should clear tokens after calling this endpoint.

    **Returns:**
    - Success message
    """
    # TODO: If ULM supports token blacklisting, implement it here
    return {"message": "Logged out successfully"}

