"""
Dependency Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.db.models import DependencyType, DependencyCriticality


class DependencyBase(BaseModel):
    """Base dependency schema"""
    name: str = Field(..., min_length=1, max_length=200)
    type: DependencyType = DependencyType.SERVICE
    criticality: DependencyCriticality = DependencyCriticality.MEDIUM
    description: Optional[str] = None
    reason: Optional[str] = None
    version_constraint: Optional[str] = None
    external_url: Optional[str] = None
    external_docs: Optional[str] = None
    notes: Optional[str] = None


class DependencyCreate(DependencyBase):
    """Schema for creating a dependency"""
    consumer_id: int = Field(..., gt=0)
    provider_id: Optional[int] = Field(None, gt=0)


class DependencyUpdate(BaseModel):
    """Schema for updating a dependency"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[DependencyType] = None
    criticality: Optional[DependencyCriticality] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    version_constraint: Optional[str] = None
    external_url: Optional[str] = None
    external_docs: Optional[str] = None
    notes: Optional[str] = None


class DependencyResponse(DependencyBase):
    """Schema for dependency response"""
    id: int
    consumer_id: int
    provider_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    # Related data
    consumer_name: Optional[str] = None
    provider_name: Optional[str] = None

    class Config:
        from_attributes = True

