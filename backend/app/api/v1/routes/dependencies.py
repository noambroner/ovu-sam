"""
Dependencies API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.dependency import (
    DependencyCreate,
    DependencyUpdate,
    DependencyResponse,
)
from app.services.dependency_service import DependencyService
from app.security.auth import get_current_user

router = APIRouter(prefix="/dependencies", tags=["dependencies"])


@router.post("", response_model=DependencyResponse, status_code=status.HTTP_201_CREATED)
async def create_dependency(
    dep_data: DependencyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new dependency.
    Requires authentication.
    """
    dep = await DependencyService.create(db, dep_data)

    # Add consumer/provider names
    if dep.consumer:
        dep.consumer_name = dep.consumer.display_name
    if dep.provider:
        dep.provider_name = dep.provider.display_name

    return dep


@router.get("", response_model=List[DependencyResponse])
async def list_dependencies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    consumer_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all dependencies with filters.
    Public endpoint.
    """
    deps = await DependencyService.get_all(
        db, skip=skip, limit=limit, consumer_id=consumer_id, provider_id=provider_id
    )

    # Add consumer/provider names
    result = []
    for dep in deps:
        dep_dict = DependencyResponse.model_validate(dep).model_dump()
        if dep.consumer:
            dep_dict["consumer_name"] = dep.consumer.display_name
        if dep.provider:
            dep_dict["provider_name"] = dep.provider.display_name
        result.append(DependencyResponse(**dep_dict))

    return result


@router.get("/{dep_id}", response_model=DependencyResponse)
async def get_dependency(
    dep_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get dependency by ID.
    Public endpoint.
    """
    dep = await DependencyService.get_by_id(db, dep_id)
    if not dep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dependency with ID {dep_id} not found"
        )

    # Add consumer/provider names
    dep_dict = DependencyResponse.model_validate(dep).model_dump()
    if dep.consumer:
        dep_dict["consumer_name"] = dep.consumer.display_name
    if dep.provider:
        dep_dict["provider_name"] = dep.provider.display_name

    return DependencyResponse(**dep_dict)


@router.put("/{dep_id}", response_model=DependencyResponse)
async def update_dependency(
    dep_id: int,
    dep_data: DependencyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Update a dependency.
    Requires authentication.
    """
    dep = await DependencyService.update(db, dep_id, dep_data)
    if not dep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dependency with ID {dep_id} not found"
        )

    # Add consumer/provider names
    if dep.consumer:
        dep.consumer_name = dep.consumer.display_name
    if dep.provider:
        dep.provider_name = dep.provider.display_name

    return dep


@router.delete("/{dep_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dependency(
    dep_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a dependency.
    Requires authentication.
    """
    success = await DependencyService.delete(db, dep_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dependency with ID {dep_id} not found"
        )
    return None

