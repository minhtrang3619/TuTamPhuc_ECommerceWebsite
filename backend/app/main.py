from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.routers import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Create upload directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/products", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/avatars", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/blog", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/returns", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/reviews", exist_ok=True)
    
    # Auto-create database tables (including new StockVoucher tables)
    from app.database.session import engine, Base
    import app.models
    Base.metadata.create_all(bind=engine)
    
    # Run ALTER TABLE to ensure target_customer_tier column exists in promotions
    from sqlalchemy import text
    from app.database.session import SessionLocal
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE promotions ADD COLUMN IF NOT EXISTS target_customer_tier VARCHAR(50)"))
        db.commit()
    except Exception as e:
        print("Error altering promotions table:", e)
    finally:
        db.close()
    
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API cho website thương mại điện tử Từ Tâm Phục",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory at startup
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Static files (uploads)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
