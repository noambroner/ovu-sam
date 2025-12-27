#!/usr/bin/env python3
"""
Script to add navigation_items column and update SAM navigation
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine


async def add_navigation_items():
    """Add navigation_items column and update SAM"""

    navigation_items = [
        {
            "id": "technical-tools",
            "label": "🔧 כלים טכניים",
            "labelEn": "🔧 Technical Tools",
            "path": "",
            "order": 100,
            "subItems": [
                {
                    "id": "dev-guidelines",
                    "label": "📋 מדריך פיתוח",
                    "labelEn": "📋 Dev Guidelines",
                    "path": "/dev-guidelines",
                    "order": 1
                },
                {
                    "id": "api-ui",
                    "label": "🔌 API UI",
                    "labelEn": "🔌 API UI",
                    "path": "/api/ui",
                    "order": 2
                },
                {
                    "id": "database-viewer",
                    "label": "🗄️ מציג מסד נתונים",
                    "labelEn": "🗄️ Database Viewer",
                    "path": "/database-viewer",
                    "order": 3
                },
                {
                    "id": "logs-backend",
                    "label": "📊 לוגים Backend",
                    "labelEn": "📊 Backend Logs",
                    "path": "/logs/backend",
                    "order": 4
                }
            ]
        }
    ]

    async with engine.begin() as conn:
        # Add column if not exists
        print("Adding navigation_items column...")
        await conn.execute(text("""
            ALTER TABLE applications
            ADD COLUMN IF NOT EXISTS navigation_items JSONB DEFAULT '[]'::jsonb
        """))
        print("✅ Column added/verified")

        # Update SAM application
        print("Updating SAM navigation items...")
        result = await conn.execute(
            text("""
                UPDATE applications
                SET navigation_items = :nav_items::jsonb
                WHERE code = 'sam'
                RETURNING id, name
            """),
            {"nav_items": str(navigation_items).replace("'", '"')}
        )

        row = result.fetchone()
        if row:
            print(f"✅ Updated SAM (ID: {row[0]}, Name: {row[1]}) successfully!")
        else:
            print("⚠️  SAM application not found in database")

    await engine.dispose()


if __name__ == "__main__":
    print("🚀 Starting navigation items update...")
    asyncio.run(add_navigation_items())
    print("✨ Done!")

