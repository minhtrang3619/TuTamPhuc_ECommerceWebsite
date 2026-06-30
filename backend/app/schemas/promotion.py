from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.promotion import PromotionType, PromotionStatus


class PromotionBase(BaseModel):
    code: str
    name: str
    type: PromotionType = PromotionType.percentage
    value: float = 0
    min_order: float = 0
    start_date: date
    end_date: Optional[date] = None
    applicable_products: Optional[str] = None


class PromotionCreate(PromotionBase):
    pass


class PromotionUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[PromotionType] = None
    value: Optional[float] = None
    min_order: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    applicable_products: Optional[str] = None
    status: Optional[PromotionStatus] = None


class PromotionResponse(PromotionBase):
    id: int
    status: PromotionStatus
    uses: int
    
    model_config = ConfigDict(from_attributes=True)
