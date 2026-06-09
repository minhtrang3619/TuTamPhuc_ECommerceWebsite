from typing import Optional, List
from datetime import datetime
from app.schemas.base import BaseSchema


class CategoryCreate(BaseSchema):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0


class CategoryUpdate(BaseSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime


class CategoryWithChildren(CategoryResponse):
    children: List["CategoryResponse"] = []
