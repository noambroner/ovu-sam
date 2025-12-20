"""
Route Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RouteBase(BaseModel):
    """Base route schema"""
    path: str = Field(..., min_length=1, max_length=500)
    method: str = Field(..., min_length=1, max_length=10)
    summary: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    requires_auth: bool = True
    required_roles: Optional[List[str]] = None
    request_body_example: Optional[Dict[str, Any]] = None
    response_example: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None


class RouteCreate(RouteBase):
    """Schema for creating a route"""
    application_id: int = Field(..., gt=0)


class RouteUpdate(BaseModel):
    """Schema for updating a route"""
    path: Optional[str] = Field(None, min_length=1, max_length=500)
    method: Optional[str] = Field(None, min_length=1, max_length=10)
    summary: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    requires_auth: Optional[bool] = None
    required_roles: Optional[List[str]] = None
    request_body_example: Optional[Dict[str, Any]] = None
    response_example: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None


class RouteResponse(RouteBase):
    """Schema for route response"""
    id: int
    application_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

