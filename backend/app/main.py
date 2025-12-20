"""
Backend - FastAPI Application
OVU Application Template

This is the main entry point for the FastAPI application.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.clients import ulm
from app.middleware.logging import RequestLoggingMiddleware
from app.api.v1.routes import auth, health, example

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"🚀 Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    logger.info(f"📡 ULM Service: {settings.ULM_SERVICE_URL}")
    logger.info(f"🔖 App Source: {settings.ULM_SERVICE_APP_SOURCE}")
    logger.info(f"🐛 Debug Mode: {settings.DEBUG}")

    yield

    # Shutdown
    logger.info("👋 Shutting down...")
    await ulm.client.aclose()
    logger.info("✅ Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.SERVICE_VERSION,
    description=f"{settings.SERVICE_NAME} API",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(health.router)  # Health checks (no prefix)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(example.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """
    Root endpoint - service information.
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "status": "running",
        "docs": f"/docs" if settings.DEBUG else "disabled",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )

