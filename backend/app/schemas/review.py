from typing import Optional, List
from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.user import UserBrief


class ReviewCreate(BaseSchema):
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None


class ReviewResponse(BaseSchema):
    id: int
    product_id: int
    user: UserBrief
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    is_verified_purchase: bool
    is_approved: bool
    created_at: datetime


class PaginatedReviews(BaseSchema):
    items: List[ReviewResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
