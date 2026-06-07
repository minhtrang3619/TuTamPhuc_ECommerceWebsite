from typing import Optional, List, Any
from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.category import CategoryResponse
from app.models.product import ProductStatus


class ProductImageResponse(BaseSchema):
    id: int
    url: str
    alt: Optional[str] = None
    is_primary: bool
    sort_order: int


class ProductVariantResponse(BaseSchema):
    id: int
    name: str
    value: str
    additional_price: float
    stock: int
    sku: Optional[str] = None


class ProductVariantCreate(BaseSchema):
    name: str
    value: str
    additional_price: float = 0.0
    stock: int = 0
    sku: Optional[str] = None


class ProductCreate(BaseSchema):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    sku: Optional[str] = None
    stock: int = 0
    status: ProductStatus = ProductStatus.ACTIVE
    category_id: int
    tags: Optional[List[str]] = None
    weight: Optional[float] = None
    is_featured: bool = False
    variants: Optional[List[ProductVariantCreate]] = None


class ProductUpdate(BaseSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    sku: Optional[str] = None
    stock: Optional[int] = None
    status: Optional[ProductStatus] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    weight: Optional[float] = None
    is_featured: Optional[bool] = None


class ProductResponse(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    sku: Optional[str] = None
    stock: int
    status: ProductStatus
    category_id: int
    category: CategoryResponse
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    tags: Optional[List[str]] = None
    weight: Optional[float] = None
    rating_avg: float
    rating_count: int
    is_featured: bool
    created_at: datetime
    updated_at: datetime


class ProductBrief(BaseSchema):
    """Minimal product info for order/cart embedding."""
    id: int
    name: str
    slug: str
    price: float
    sale_price: Optional[float] = None
    images: List[ProductImageResponse] = []
    rating_avg: float


class PaginatedProducts(BaseSchema):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
