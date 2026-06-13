import enum
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    COD = "cod"
    BANK_TRANSFER = "bank_transfer"
    VNPAY = "vnpay"
    MOMO = "momo"


class Order(BaseModel):
    __tablename__ = "orders"

    order_code = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Shipping
    shipping_address = Column(JSON, nullable=False)
    # {full_name, phone, address, ward, district, province}

    # Status
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)

    # Pricing
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    shipping_fee = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)

    notes = Column(Text, nullable=True)
    coupon_code = Column(String(50), nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    return_request = relationship("ReturnRequest", back_populates="order", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order id={self.id} code={self.order_code} status={self.status}>"


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)        # Price at time of order
    subtotal = Column(Float, nullable=False)
    product_snapshot = Column(JSON, nullable=True)  # Snapshot of product name/image

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant")
    reviews = relationship("Review", back_populates="order_item", cascade="all, delete-orphan")

    @property
    def is_reviewed(self) -> bool:
        return len(self.reviews) > 0
