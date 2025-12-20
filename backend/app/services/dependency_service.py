"""
Dependency Service - Business logic for dependencies
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import Dependency, Application
from app.schemas.dependency import DependencyCreate, DependencyUpdate


class DependencyService:
    """Service for managing dependencies"""

    @staticmethod
    async def create(db: AsyncSession, dep_data: DependencyCreate) -> Dependency:
        """Create a new dependency"""
        dep_dict = dep_data.model_dump(exclude_unset=True)

        dep = Dependency(**dep_dict)
        db.add(dep)
        await db.commit()
        await db.refresh(dep)

        return dep

    @staticmethod
    async def get_by_id(db: AsyncSession, dep_id: int) -> Optional[Dependency]:
        """Get dependency by ID"""
        result = await db.execute(
            select(Dependency)
            .options(
                selectinload(Dependency.consumer),
                selectinload(Dependency.provider)
            )
            .where(Dependency.id == dep_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        consumer_id: Optional[int] = None,
        provider_id: Optional[int] = None,
    ) -> List[Dependency]:
        """Get all dependencies with filters"""
        query = select(Dependency).options(
            selectinload(Dependency.consumer),
            selectinload(Dependency.provider)
        )

        if consumer_id:
            query = query.where(Dependency.consumer_id == consumer_id)
        if provider_id:
            query = query.where(Dependency.provider_id == provider_id)

        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_by_consumer(db: AsyncSession, consumer_id: int) -> List[Dependency]:
        """Get all dependencies required by an application"""
        result = await db.execute(
            select(Dependency)
            .options(selectinload(Dependency.provider))
            .where(Dependency.consumer_id == consumer_id)
        )
        return result.scalars().all()

    @staticmethod
    async def get_by_provider(db: AsyncSession, provider_id: int) -> List[Dependency]:
        """Get all dependencies provided by an application"""
        result = await db.execute(
            select(Dependency)
            .options(selectinload(Dependency.consumer))
            .where(Dependency.provider_id == provider_id)
        )
        return result.scalars().all()

    @staticmethod
    async def update(db: AsyncSession, dep_id: int, dep_data: DependencyUpdate) -> Optional[Dependency]:
        """Update a dependency"""
        dep = await DependencyService.get_by_id(db, dep_id)
        if not dep:
            return None

        update_data = dep_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(dep, key, value)

        await db.commit()
        await db.refresh(dep)

        return dep

    @staticmethod
    async def delete(db: AsyncSession, dep_id: int) -> bool:
        """Delete a dependency"""
        dep = await DependencyService.get_by_id(db, dep_id)
        if not dep:
            return False

        await db.delete(dep)
        await db.commit()

        return True

