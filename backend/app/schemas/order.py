from typing import Optional, List, Any, Dict
from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.product import ProductBrief, ProductVariantResponse
from app.schemas.user import UserBrief
from app.models.order import OrderStatus, PaymentStatus, PaymentMethod


class ShippingAddressSchema(BaseSchema):
    full_name: str
    phone: str
    address: str
    ward: str
    district: str
    province: str


class OrderItemResponse(BaseSchema):
    id: int
    product: ProductBrief
    variant: Optional[ProductVariantResponse] = None
    quantity: int
    price: float
    subtotal: float
    product_snapshot: Optional[Dict[str, Any]] = None


class OrderItemCreate(BaseSchema):
    product_id: int
    quantity: int
    color_name: Optional[str] = None
    color_hex: Optional[str] = None
    size: Optional[str] = None
    price: float


class OrderCreate(BaseSchema):
    shipping_address: ShippingAddressSchema
    payment_method: PaymentMethod
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = None
    discount: Optional[float] = 0.0
    shipping_fee: Optional[float] = 30000.0



class OrderStatusUpdate(BaseSchema):
    status: OrderStatus


class OrderResponse(BaseSchema):
    id: int
    order_code: str
    user: UserBrief
    items: List[OrderItemResponse] = []
    shipping_address: Dict[str, Any]
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    subtotal: float
    discount: float
    shipping_fee: float
    total: float
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PaginatedOrders(BaseSchema):
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
