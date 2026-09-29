import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthPlus - Doctor Appointment Booking System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "super-secret-healthplus-jwt-key-2026-production-ready"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Primary Database: SQLite (zero-config, high performance, self-contained)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./healthplus.db")

    # CORS origins
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://health-plus.anasxonummataliy.dev",
        "http://health-plus.anasxonummataliy.dev",
        "https://api-health-plus.anasxonummataliy.dev",
        "http://api-health-plus.anasxonummataliy.dev",
        "*",
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")


settings = Settings()
