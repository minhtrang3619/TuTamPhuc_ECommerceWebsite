import enum
from sqlalchemy import Column, String, Integer, Boolean
from app.models.base import BaseModel


class Customer(BaseModel):
    __tablename__ = "customers"

    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    avatar = Column(String(500), nullable=True)
    tier = Column(String(50), default="Tiêu chuẩn", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
