import enum
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ReturnRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReturnRequest(BaseModel):
    __tablename__ = "return_requests"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    reason = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    images = Column(JSON, nullable=False)  # List of URLs: ["url1", "url2"]
    shipping_method = Column(String(50), nullable=False)  # "pickup" or "dropoff"
    bank_name = Column(String(100), nullable=False)
    account_number = Column(String(50), nullable=False)
    account_holder = Column(String(100), nullable=False)
    status = Column(Enum(ReturnRequestStatus), default=ReturnRequestStatus.PENDING, nullable=False)

    order = relationship("Order", back_populates="return_request")
