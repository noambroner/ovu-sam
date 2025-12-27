"""
SQLAlchemy Models for SAM Database
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class AppType(str, enum.Enum):
    """Application type enum"""
    CORE = "core"
    FEATURE = "feature"
    TOOL = "tool"
    INTEGRATION = "integration"
    MICROSERVICE = "microservice"


class AppStatus(str, enum.Enum):
    """Application status enum"""
    ACTIVE = "active"
    DEVELOPMENT = "development"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class DependencyType(str, enum.Enum):
    """Dependency type enum"""
    API = "api"
    DATABASE = "database"
    CACHE = "cache"
    SERVICE = "service"
    LIBRARY = "library"
    EXTERNAL = "external"


class DependencyCriticality(str, enum.Enum):
    """Dependency criticality enum"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    OPTIONAL = "optional"


class Application(Base):
    """
    Application Model - Stores information about each OVU application
    """
    __tablename__ = "applications"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Basic Info
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)  # e.g., "ULM", "AAM", "SAM"
    description = Column(Text, nullable=True)
    purpose = Column(Text, nullable=True)

    # Classification
    type = Column(SQLEnum(AppType), nullable=False, default=AppType.FEATURE, index=True)
    status = Column(SQLEnum(AppStatus), nullable=False, default=AppStatus.DEVELOPMENT, index=True)
    category = Column(String(50), nullable=True, index=True)  # e.g., "Authentication", "Admin", "Mapping"

    # Ownership
    owner_team = Column(String(100), nullable=True)
    owner_email = Column(String(200), nullable=True)

    # Version & Release
    version = Column(String(20), nullable=True)
    release_date = Column(DateTime, nullable=True)

    # URLs & Links
    frontend_url = Column(String(500), nullable=True)
    backend_url = Column(String(500), nullable=True)
    docs_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)

    # Technical Stack (JSON)
    tech_stack = Column(JSON, nullable=True)  # {"frontend": [...], "backend": [...], "database": [...]}

    # Documentation
    getting_started = Column(Text, nullable=True)
    api_reference = Column(Text, nullable=True)
    integration_guide = Column(Text, nullable=True)
    troubleshooting = Column(Text, nullable=True)
    faq = Column(Text, nullable=True)

    # Metadata
    icon = Column(String(500), nullable=True)  # Icon URL or emoji
    color = Column(String(7), nullable=True)  # Hex color
    tags = Column(JSON, nullable=True)  # Array of tags
    display_order = Column(Integer, nullable=True)  # Ordering for sidebar/app list
    navigation_items = Column(JSON, nullable=True)  # Navigation menu items (legacy)
    menu_items = Column(JSON, nullable=True)  # Menu items for sidebar

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(String(200), nullable=True)
    updated_by = Column(String(200), nullable=True)

    # Relationships
    dependencies_provided = relationship(
        "Dependency",
        foreign_keys="Dependency.provider_id",
        back_populates="provider",
        cascade="all, delete-orphan"
    )
    dependencies_required = relationship(
        "Dependency",
        foreign_keys="Dependency.consumer_id",
        back_populates="consumer",
        cascade="all, delete-orphan"
    )
    routes = relationship("Route", back_populates="application", cascade="all, delete-orphan")
    deployments = relationship("Deployment", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application {self.code}: {self.display_name}>"


class Dependency(Base):
    """
    Dependency Model - Tracks dependencies between applications
    """
    __tablename__ = "dependencies"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign keys
    consumer_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)

    # Dependency Info
    name = Column(String(200), nullable=False)
    type = Column(SQLEnum(DependencyType), nullable=False, default=DependencyType.SERVICE, index=True)
    criticality = Column(SQLEnum(DependencyCriticality), nullable=False, default=DependencyCriticality.MEDIUM)

    # Description
    description = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)  # Why is this dependency needed

    # Version constraints
    version_constraint = Column(String(50), nullable=True)  # e.g., ">=2.0.0"

    # External dependencies (if provider_id is null)
    external_url = Column(String(500), nullable=True)
    external_docs = Column(String(500), nullable=True)

    # Metadata
    notes = Column(Text, nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    consumer = relationship("Application", foreign_keys=[consumer_id], back_populates="dependencies_required")
    provider = relationship("Application", foreign_keys=[provider_id], back_populates="dependencies_provided")

    def __repr__(self):
        return f"<Dependency {self.consumer_id} -> {self.provider_id}: {self.name}>"


class Route(Base):
    """
    Route Model - Stores API routes and endpoints for each application
    """
    __tablename__ = "routes"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)

    # Route Info
    path = Column(String(500), nullable=False)
    method = Column(String(10), nullable=False)  # GET, POST, PUT, DELETE, PATCH
    summary = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    # Security
    requires_auth = Column(Boolean, default=True, nullable=False)
    required_roles = Column(JSON, nullable=True)  # Array of required roles

    # Request/Response
    request_body_example = Column(JSON, nullable=True)
    response_example = Column(JSON, nullable=True)

    # Tags & Categories
    tags = Column(JSON, nullable=True)
    category = Column(String(100), nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="routes")

    def __repr__(self):
        return f"<Route {self.method} {self.path}>"


class TechStack(Base):
    """
    Tech Stack Model - Stores technology stack details
    (Can be normalized separately if needed)
    """
    __tablename__ = "tech_stacks"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Tech Info
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # frontend, backend, database, cache, etc.
    version = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    # Links
    docs_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)

    # Metadata
    icon = Column(String(500), nullable=True)
    color = Column(String(7), nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<TechStack {self.name}>"


class Deployment(Base):
    """
    Deployment Model - Stores deployment information for each application
    """
    __tablename__ = "deployments"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)

    # Deployment Info
    environment = Column(String(50), nullable=False, index=True)  # production, staging, development
    component = Column(String(50), nullable=False)  # frontend, backend, database

    # Server Info
    server_name = Column(String(100), nullable=True)
    server_ip = Column(String(50), nullable=True)
    port = Column(Integer, nullable=True)

    # URLs
    url = Column(String(500), nullable=True)
    health_check_url = Column(String(500), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_deployed_at = Column(DateTime, nullable=True)
    last_health_check = Column(DateTime, nullable=True)
    health_status = Column(String(20), nullable=True)  # healthy, unhealthy, unknown

    # Metadata
    notes = Column(Text, nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="deployments")

    def __repr__(self):
        return f"<Deployment {self.environment}/{self.component}>"

