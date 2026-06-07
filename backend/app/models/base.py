from sqlalchemy import Column, Integer, DateTime, func
from app.database.session import Base


class TimestampMixin:
    """Add created_at and updated_at to any model."""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class BaseModel(Base, TimestampMixin):
    """Abstract base model with id + timestamps."""
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
