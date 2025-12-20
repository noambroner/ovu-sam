"""
Deployment Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DeploymentBase(BaseModel):
    """Base deployment schema"""
    environment: str = Field(..., min_length=1, max_length=50)
    component: str = Field(..., min_length=1, max_length=50)
    server_name: Optional[str] = None
    server_ip: Optional[str] = None
    port: Optional[int] = Field(None, gt=0, lt=65536)
    url: Optional[str] = None
    health_check_url: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None


class DeploymentCreate(DeploymentBase):
    """Schema for creating a deployment"""
    application_id: int = Field(..., gt=0)


class DeploymentUpdate(BaseModel):
    """Schema for updating a deployment"""
    environment: Optional[str] = Field(None, min_length=1, max_length=50)
    component: Optional[str] = Field(None, min_length=1, max_length=50)
    server_name: Optional[str] = None
    server_ip: Optional[str] = None
    port: Optional[int] = Field(None, gt=0, lt=65536)
    url: Optional[str] = None
    health_check_url: Optional[str] = None
    is_active: Optional[bool] = None
    last_deployed_at: Optional[datetime] = None
    last_health_check: Optional[datetime] = None
    health_status: Optional[str] = None
    notes: Optional[str] = None


class DeploymentResponse(DeploymentBase):
    """Schema for deployment response"""
    id: int
    application_id: int
    last_deployed_at: Optional[datetime] = None
    last_health_check: Optional[datetime] = None
    health_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

