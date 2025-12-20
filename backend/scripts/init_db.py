"""
Initialize SAM Database with Initial Data
Run this script to populate the database with OVU applications
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.base import AsyncSessionLocal, engine, Base
from app.db.models import Application, Dependency, AppType, AppStatus, DependencyType, DependencyCriticality
from datetime import datetime


async def create_tables():
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully")


async def seed_applications():
    """Seed initial applications"""
    async with AsyncSessionLocal() as session:
        # ULM - User Login Manager
        ulm = Application(
            name="User Login Manager",
            display_name="User Login Manager",
            code="ULM",
            description="Central authentication and user management service for the OVU ecosystem",
            purpose="Provides centralized authentication, user management, and role-based access control for all OVU applications",
            type=AppType.CORE,
            status=AppStatus.ACTIVE,
            category="Authentication",
            owner_team="Core Team",
            owner_email="noam@datapc.co.il",
            version="2.0.0",
            frontend_url="https://ulm.ovu.co.il",
            backend_url="https://ulm.ovu.co.il/api/v1",
            docs_url="https://ulm.ovu.co.il/docs",
            github_url="https://github.com/noambroner/ovu-ulm",
            tech_stack={
                "frontend": ["React 18", "TypeScript", "Vite"],
                "backend": ["FastAPI", "Python 3.11"],
                "database": ["PostgreSQL 15"],
                "cache": ["Redis 7"]
            },
            icon="🔐",
            color="#3b82f6",
            tags=["auth", "users", "core"],
            created_by="system",
            updated_by="system"
        )
        session.add(ulm)

        # AAM - Admin Area Manager
        aam = Application(
            name="Admin Area Manager",
            display_name="Admin Area Manager",
            code="AAM",
            description="Three-tier admin management system with base, role, and installer components",
            purpose="Provides administrative capabilities and role-based access management across the OVU ecosystem",
            type=AppType.CORE,
            status=AppStatus.ACTIVE,
            category="Administration",
            owner_team="Core Team",
            owner_email="noam@datapc.co.il",
            version="1.0.0",
            frontend_url="https://aam.bflow.co.il",
            backend_url="https://base.aam.bflow.co.il/api/v1",
            docs_url="https://aam.bflow.co.il/docs",
            github_url="https://github.com/noambroner/ovu-aam",
            tech_stack={
                "frontend": ["React 18", "TypeScript", "Vite"],
                "backend": ["FastAPI", "Python 3.11"],
                "database": ["PostgreSQL 15"],
                "cache": ["Redis 7"]
            },
            icon="👑",
            color="#8b5cf6",
            tags=["admin", "management", "core"],
            created_by="system",
            updated_by="system"
        )
        session.add(aam)

        # SAM - System Application Mapping
        sam = Application(
            name="System Application Mapping",
            display_name="System Mapping Manager",
            code="SAM",
            description="Central registry and documentation system for all OVU applications and their dependencies",
            purpose="Provides a comprehensive map of the OVU ecosystem, tracking applications, dependencies, routes, and deployments",
            type=AppType.CORE,
            status=AppStatus.ACTIVE,
            category="Mapping",
            owner_team="Core Team",
            owner_email="noam@datapc.co.il",
            version="1.0.0",
            frontend_url="https://sam.ovu.co.il",
            backend_url="https://sam.ovu.co.il/api/v1",
            docs_url="https://sam.ovu.co.il/docs",
            github_url="https://github.com/noambroner/ovu-sam",
            tech_stack={
                "frontend": ["React 18", "TypeScript", "Vite"],
                "backend": ["FastAPI", "Python 3.11"],
                "database": ["PostgreSQL 15"],
                "cache": ["Redis 7"]
            },
            icon="🗺️",
            color="#10b981",
            tags=["mapping", "documentation", "core"],
            created_by="system",
            updated_by="system"
        )
        session.add(sam)

        await session.commit()
        await session.refresh(ulm)
        await session.refresh(aam)
        await session.refresh(sam)

        print(f"✅ Created applications: ULM (ID: {ulm.id}), AAM (ID: {aam.id}), SAM (ID: {sam.id})")

        # Create dependencies
        # AAM depends on ULM
        dep1 = Dependency(
            consumer_id=aam.id,
            provider_id=ulm.id,
            name="Authentication Service",
            type=DependencyType.SERVICE,
            criticality=DependencyCriticality.CRITICAL,
            description="AAM uses ULM for user authentication and authorization",
            reason="Required for all user authentication flows"
        )
        session.add(dep1)

        # SAM depends on ULM
        dep2 = Dependency(
            consumer_id=sam.id,
            provider_id=ulm.id,
            name="Authentication Service",
            type=DependencyType.SERVICE,
            criticality=DependencyCriticality.CRITICAL,
            description="SAM uses ULM for user authentication",
            reason="Required for all user authentication flows"
        )
        session.add(dep2)

        # ULM depends on PostgreSQL (external)
        dep3 = Dependency(
            consumer_id=ulm.id,
            provider_id=None,
            name="PostgreSQL Database",
            type=DependencyType.DATABASE,
            criticality=DependencyCriticality.CRITICAL,
            description="Primary database for user data",
            external_url="postgresql://localhost:5432/ulm_db"
        )
        session.add(dep3)

        # ULM depends on Redis (external)
        dep4 = Dependency(
            consumer_id=ulm.id,
            provider_id=None,
            name="Redis Cache",
            type=DependencyType.CACHE,
            criticality=DependencyCriticality.HIGH,
            description="Session storage and caching",
            external_url="redis://localhost:6379/0"
        )
        session.add(dep4)

        await session.commit()
        print("✅ Created dependencies")


async def main():
    """Main function"""
    print("🚀 Initializing SAM Database...")

    try:
        await create_tables()
        await seed_applications()
        print("\n✅ Database initialization complete!")
        print("\n📊 Summary:")
        print("  - 3 applications created (ULM, AAM, SAM)")
        print("  - 4 dependencies created")
        print("\n🌐 You can now access SAM at: http://localhost:3005")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

