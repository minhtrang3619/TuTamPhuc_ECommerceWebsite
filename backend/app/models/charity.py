from sqlalchemy import Column, String, Text, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class CharityCampaign(BaseModel):
    __tablename__ = "charity_campaigns"

    name = Column(String(255), nullable=False)
    slogan = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    target_amount = Column(Float, nullable=False)
    raised_amount = Column(Float, default=0.0, nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # "active" (Đang thực hiện), "completed" (Đã hoàn thành), "closing" (Sắp hoàn thành)
    gallery_images = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    quote = Column(String(500), nullable=True)
    address = Column(String(255), nullable=True)

    # Relationships
    transactions = relationship("CharityTransaction", back_populates="campaign", cascade="all, delete-orphan")

class CharityTransaction(BaseModel):
    __tablename__ = "charity_transactions"

    campaign_id = Column(Integer, ForeignKey("charity_campaigns.id"), nullable=True)
    donor_recipient = Column(String(255), nullable=False)  # Name of donor (e.g. customer name) or recipient (e.g. materials supplier)
    amount = Column(Float, nullable=False)                 # Positive for donations, negative for disbursements/expenses
    transaction_type = Column(String(50), nullable=False)  # "donation" (Đóng góp) or "expense" (Chi phí)
    description = Column(Text, nullable=True)
    order_code = Column(String(50), nullable=True)

    # Relationships
    campaign = relationship("CharityCampaign", back_populates="transactions")
