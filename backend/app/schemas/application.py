"""
Application Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl

from app.db.models import AppType, AppStatus


class TechStackInfo(BaseModel):
    """Tech stack information"""
    frontend: Optional[List[str]] = None
    backend: Optional[List[str]] = None
    database: Optional[List[str]] = None
    cache: Optional[List[str]] = None
    other: Optional[List[str]] = None


class ApplicationBase(BaseModel):
    """Base application schema"""
    name: str = Field(..., min_length=1, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = None
    purpose: Optional[str] = None
    type: AppType = AppType.FEATURE
    status: AppStatus = AppStatus.DEVELOPMENT
    category: Optional[str] = None
    owner_team: Optional[str] = None
    owner_email: Optional[str] = None
    version: Optional[str] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    docs_url: Optional[str] = None
    github_url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    display_order: Optional[int] = None
    tags: Optional[List[str]] = None
    navigation_items: Optional[List[Dict[str, Any]]] = None
    menu_items: Optional[List[Dict[str, Any]]] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application"""
    tech_stack: Optional[TechStackInfo] = None
    getting_started: Optional[str] = None
    api_reference: Optional[str] = None
    integration_guide: Optional[str] = None
    troubleshooting: Optional[str] = None
    faq: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating an application"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    description: Optional[str] = None
    purpose: Optional[str] = None
    type: Optional[AppType] = None
    status: Optional[AppStatus] = None
    category: Optional[str] = None
    owner_team: Optional[str] = None
    owner_email: Optional[str] = None
    version: Optional[str] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    docs_url: Optional[str] = None
    github_url: Optional[str] = None
    tech_stack: Optional[TechStackInfo] = None
    getting_started: Optional[str] = None
    api_reference: Optional[str] = None
    integration_guide: Optional[str] = None
    troubleshooting: Optional[str] = None
    faq: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    tags: Optional[List[str]] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response"""
    id: int
    tech_stack: Optional[Dict[str, Any]] = None
    navigation_items: Optional[List[Dict[str, Any]]] = None
    menu_items: Optional[List[Dict[str, Any]]] = None
    release_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


class DependencySummary(BaseModel):
    """Summary of a dependency for list view"""
    id: int
    name: str
    type: str
    criticality: str

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """Schema for application list item"""
    id: int
    name: str
    display_name: str
    code: str
    description: Optional[str] = None
    type: AppType
    status: AppStatus
    category: Optional[str] = None
    version: Optional[str] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    display_order: Optional[int] = None
    tags: Optional[List[str]] = None
    menu_items: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

    # Counts
    dependencies_count: Optional[int] = 0
    dependents_count: Optional[int] = 0
    routes_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ApplicationDetailResponse(ApplicationResponse):
    """Schema for detailed application response"""
    getting_started: Optional[str] = None
    api_reference: Optional[str] = None
    integration_guide: Optional[str] = None
    troubleshooting: Optional[str] = None
    faq: Optional[str] = None
    navigation_items: Optional[List[Dict[str, Any]]] = None
    menu_items: Optional[List[Dict[str, Any]]] = None

    # Related data (will be populated by service layer)
    dependencies_required: Optional[List[DependencySummary]] = []
    dependencies_provided: Optional[List[DependencySummary]] = []
    routes: Optional[List[Dict[str, Any]]] = []
    deployments: Optional[List[Dict[str, Any]]] = []

    class Config:
        from_attributes = True

