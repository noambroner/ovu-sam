"""
Configuration settings for sam service
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import secrets


class Settings(BaseSettings):
    # Service Information
    SERVICE_NAME: str = "sam Backend"
    SERVICE_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8005

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    DEBUG: bool = False
    TESTING: bool = False

    # CORS (comma-separated string in .env, e.g., "http://localhost:3000,http://localhost:3005")
    BACKEND_CORS_ORIGINS: str = "http://localhost:3005,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]

    # ULM Integration
    ULM_SERVICE_URL: str = "http://localhost:8001"
    ULM_SERVICE_APP_SOURCE: str = "sam-backend"
    ULM_SERVICE_USERNAME: Optional[str] = None
    ULM_SERVICE_PASSWORD: Optional[str] = None

    # Optional: Database
    DATABASE_URL: Optional[str] = None
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40

    # Optional: Redis
    REDIS_URL: Optional[str] = None
    REDIS_PASSWORD: Optional[str] = None

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Health Check
    HEALTH_CHECK_PATH: str = "/health"
    READY_CHECK_PATH: str = "/ready"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

