"""
Applications API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationDetailResponse,
)
from app.services.application_service import ApplicationService
from app.security.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new application.
    Requires authentication.
    """
    # Check if app with same code already exists
    existing = await ApplicationService.get_by_code(db, app_data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application with code '{app_data.code}' already exists"
        )

    app = await ApplicationService.create(db, app_data, current_user.get("email"))
    return app


@router.get("", response_model=List[ApplicationListResponse])
async def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all applications with counts.
    Public endpoint.
    """
    apps = await ApplicationService.get_with_counts(
        db, skip=skip, limit=limit, type=type, status=status, category=category
    )
    return apps


@router.get("/search", response_model=List[ApplicationResponse])
async def search_applications(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Search applications by name, code, or description.
    Public endpoint.
    """
    apps = await ApplicationService.search(db, q, limit)
    return apps


@router.get("/{app_id}", response_model=ApplicationDetailResponse)
async def get_application(
    app_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get application by ID with all related data.
    Public endpoint.
    """
    app = await ApplicationService.get_detail(db, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    return app


@router.get("/code/{code}", response_model=ApplicationDetailResponse)
async def get_application_by_code(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get application by code with all related data.
    Public endpoint.
    """
    app = await ApplicationService.get_by_code(db, code)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with code '{code}' not found"
        )

    # Get full detail
    detail = await ApplicationService.get_detail(db, app.id)
    return detail


@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: int,
    app_data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Update an application.
    Requires authentication.
    """
    app = await ApplicationService.update(db, app_id, app_data, current_user.get("email"))
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    return app


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete an application.
    Requires authentication.
    """
    success = await ApplicationService.delete(db, app_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    return None

