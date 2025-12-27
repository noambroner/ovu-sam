"""
Application Service - Business logic for applications
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.models import Application, Dependency, Route, Deployment
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationDetailResponse,
)


class ApplicationService:
    """Service for managing applications"""

    @staticmethod
    async def create(db: AsyncSession, app_data: ApplicationCreate, user_email: Optional[str] = None) -> Application:
        """Create a new application"""
        # Convert Pydantic model to dict
        app_dict = app_data.model_dump(exclude_unset=True)

        # Convert tech_stack to dict if it's a Pydantic model
        if 'tech_stack' in app_dict and app_dict['tech_stack']:
            app_dict['tech_stack'] = app_dict['tech_stack'].model_dump() if hasattr(app_dict['tech_stack'], 'model_dump') else app_dict['tech_stack']

        # Add audit info
        if user_email:
            app_dict['created_by'] = user_email
            app_dict['updated_by'] = user_email

        # Create application
        app = Application(**app_dict)
        db.add(app)
        await db.commit()
        await db.refresh(app)

        return app

    @staticmethod
    async def get_by_id(db: AsyncSession, app_id: int) -> Optional[Application]:
        """Get application by ID"""
        result = await db.execute(
            select(Application).where(Application.id == app_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, code: str) -> Optional[Application]:
        """Get application by code"""
        result = await db.execute(
            select(Application).where(Application.code == code)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        type: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Application]:
        """Get all applications with filters"""
        query = select(Application)

        # Apply filters
        if type:
            query = query.where(Application.type == type)
        if status:
            query = query.where(Application.status == status)
        if category:
            query = query.where(Application.category == category)

        # Apply ordering & pagination
        query = query.order_by(
            Application.display_order.asc().nulls_last(),
            Application.name.asc()
        ).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_with_counts(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        type: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[ApplicationListResponse]:
        """Get all applications with dependency/route counts"""
        # Base query
        query = select(Application)

        # Apply filters
        if type:
            query = query.where(Application.type == type)
        if status:
            query = query.where(Application.status == status)
        if category:
            query = query.where(Application.category == category)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        apps = result.scalars().all()

        # Build response with counts
        response = []
        for app in apps:
            # Count dependencies
            deps_required = await db.execute(
                select(func.count(Dependency.id)).where(Dependency.consumer_id == app.id)
            )
            deps_provided = await db.execute(
                select(func.count(Dependency.id)).where(Dependency.provider_id == app.id)
            )
            routes_count = await db.execute(
                select(func.count(Route.id)).where(Route.application_id == app.id)
            )

            app_dict = {
                "id": app.id,
                "name": app.name,
                "display_name": app.display_name,
                "code": app.code,
                "description": app.description,
                "type": app.type,
                "status": app.status,
                "category": app.category,
                "version": app.version,
                "frontend_url": app.frontend_url,
                "backend_url": app.backend_url,
                "icon": app.icon,
                "color": app.color,
                "display_order": app.display_order,
                "tags": app.tags,
                "menu_items": app.menu_items,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
                "dependencies_count": deps_required.scalar_one(),
                "dependents_count": deps_provided.scalar_one(),
                "routes_count": routes_count.scalar_one(),
            }
            response.append(ApplicationListResponse(**app_dict))

        return response

    @staticmethod
    async def get_detail(db: AsyncSession, app_id: int) -> Optional[ApplicationDetailResponse]:
        """Get application with all related data"""
        # Get application with relationships
        result = await db.execute(
            select(Application)
            .options(
                selectinload(Application.dependencies_required),
                selectinload(Application.dependencies_provided),
                selectinload(Application.routes),
                selectinload(Application.deployments),
            )
            .where(Application.id == app_id)
        )
        app = result.scalar_one_or_none()

        if not app:
            return None

        # Build response
        app_dict = {
            **ApplicationResponse.model_validate(app).model_dump(),
            "getting_started": app.getting_started,
            "api_reference": app.api_reference,
            "integration_guide": app.integration_guide,
            "troubleshooting": app.troubleshooting,
            "faq": app.faq,
            "dependencies_required": [
                {
                    "id": dep.id,
                    "name": dep.name,
                    "type": dep.type,
                    "criticality": dep.criticality,
                }
                for dep in app.dependencies_required
            ],
            "dependencies_provided": [
                {
                    "id": dep.id,
                    "name": dep.name,
                    "type": dep.type,
                    "criticality": dep.criticality,
                }
                for dep in app.dependencies_provided
            ],
            "routes": [
                {
                    "id": route.id,
                    "path": route.path,
                    "method": route.method,
                    "summary": route.summary,
                }
                for route in app.routes
            ],
            "deployments": [
                {
                    "id": deploy.id,
                    "environment": deploy.environment,
                    "component": deploy.component,
                    "url": deploy.url,
                    "is_active": deploy.is_active,
                }
                for deploy in app.deployments
            ],
        }

        return ApplicationDetailResponse(**app_dict)

    @staticmethod
    async def update(
        db: AsyncSession,
        app_id: int,
        app_data: ApplicationUpdate,
        user_email: Optional[str] = None
    ) -> Optional[Application]:
        """Update an application"""
        app = await ApplicationService.get_by_id(db, app_id)
        if not app:
            return None

        # Update fields
        update_data = app_data.model_dump(exclude_unset=True)

        # Convert tech_stack to dict if it's a Pydantic model
        if 'tech_stack' in update_data and update_data['tech_stack']:
            update_data['tech_stack'] = update_data['tech_stack'].model_dump() if hasattr(update_data['tech_stack'], 'model_dump') else update_data['tech_stack']

        # Add audit info
        if user_email:
            update_data['updated_by'] = user_email

        for key, value in update_data.items():
            setattr(app, key, value)

        await db.commit()
        await db.refresh(app)

        return app

    @staticmethod
    async def delete(db: AsyncSession, app_id: int) -> bool:
        """Delete an application"""
        app = await ApplicationService.get_by_id(db, app_id)
        if not app:
            return False

        await db.delete(app)
        await db.commit()

        return True

    @staticmethod
    async def search(db: AsyncSession, query: str, limit: int = 10) -> List[Application]:
        """Search applications by name, code, or description"""
        search_query = select(Application).where(
            (Application.name.ilike(f"%{query}%")) |
            (Application.code.ilike(f"%{query}%")) |
            (Application.display_name.ilike(f"%{query}%")) |
            (Application.description.ilike(f"%{query}%"))
        ).limit(limit)

        result = await db.execute(search_query)
        return result.scalars().all()

