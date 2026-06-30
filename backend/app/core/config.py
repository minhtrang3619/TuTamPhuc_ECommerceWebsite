from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Từ Tâm Phục API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://tutamphuc:tutamphuc123@localhost:5432/tutamphuc_db"

    # JWT
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/jpg", "image/png"]

    # Admin seed
    ADMIN_EMAIL: str = "admin@tutamphuc.vn"
    ADMIN_PASSWORD: str = "Admin@123456"

    # GHN Shipping Config
    GHN_TOKEN: str = "dca1e03c-8302-11eb-82c3-eb6c9d2c1604"
    GHN_SHOP_ID: int = 80000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
