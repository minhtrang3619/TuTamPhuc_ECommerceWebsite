from typing import Optional, List
from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.product import ProductBrief, ProductVariantResponse


class CartItemResponse(BaseSchema):
    id: int
    product: ProductBrief
    variant: Optional[ProductVariantResponse] = None
    quantity: int
    price: float
    subtotal: float


class CartResponse(BaseSchema):
    id: int
    items: List[CartItemResponse] = []
    total_items: int
    subtotal: float


class AddToCartRequest(BaseSchema):
    product_id: int
    quantity: int = 1
    variant_id: Optional[int] = None


class UpdateCartItemRequest(BaseSchema):
    quantity: int
