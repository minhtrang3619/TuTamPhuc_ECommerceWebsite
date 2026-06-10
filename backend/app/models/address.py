from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Address(BaseModel):
    __tablename__ = "addresses"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    province = Column(String(255), nullable=False)
    district = Column(String(255), nullable=False)
    ward = Column(String(255), nullable=False)
    street = Column(String(255), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="addresses")
