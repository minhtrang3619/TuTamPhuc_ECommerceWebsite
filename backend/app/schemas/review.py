from typing import Optional, List
from datetime import datetime
from pydantic import model_validator
from app.schemas.base import BaseSchema
from app.schemas.user import UserBrief


class ReviewCreate(BaseSchema):
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None
    is_anonymous: bool = False
    order_item_id: Optional[int] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None


class ReviewReply(BaseSchema):
    reply: str


class ReviewResponse(BaseSchema):
    id: int
    product_id: int
    user: UserBrief
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    is_verified_purchase: bool
    is_approved: bool
    is_anonymous: bool = False
    reply: Optional[str] = None
    order_code: Optional[str] = None
    product_color: Optional[str] = None
    product_size: Optional[str] = None
    created_at: datetime

    @model_validator(mode="after")
    def mask_anonymous_user(self) -> "ReviewResponse":
        if self.is_anonymous:
            self.user = UserBrief(id=0, full_name="Người dùng ẩn danh", avatar=None)
        return self


class AdminReviewResponse(BaseSchema):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    user: UserBrief
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    is_anonymous: bool
    reply: Optional[str] = None
    order_code: Optional[str] = None
    product_color: Optional[str] = None
    product_size: Optional[str] = None
    order_status: Optional[str] = None
    order_total: Optional[float] = None
    order_date: Optional[datetime] = None
    order_recipient_name: Optional[str] = None
    order_recipient_phone: Optional[str] = None
    order_recipient_address: Optional[str] = None
    order_payment_method: Optional[str] = None
    order_payment_status: Optional[str] = None
    created_at: datetime


class PaginatedReviews(BaseSchema):
    items: List[ReviewResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
