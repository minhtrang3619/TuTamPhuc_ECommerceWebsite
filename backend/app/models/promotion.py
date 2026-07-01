import enum
from sqlalchemy import Column, String, Float, Enum, Integer, Date
from app.models.base import BaseModel


class PromotionType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"
    free_shipping = "free_shipping"


class PromotionStatus(str, enum.Enum):
    active = "active"
    paused = "paused"


class Promotion(BaseModel):
    __tablename__ = "promotions"

    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(Enum(PromotionType), nullable=False, default=PromotionType.percentage)
    value = Column(Float, nullable=False, default=0)
    min_order = Column(Float, nullable=False, default=0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    applicable_products = Column(String(500), nullable=True)
    status = Column(Enum(PromotionStatus), nullable=False, default=PromotionStatus.active)
    uses = Column(Integer, nullable=False, default=0)
    target_customer_tier = Column(String(50), nullable=True, default=None)
