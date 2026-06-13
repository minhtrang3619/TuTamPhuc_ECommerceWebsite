from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Review(BaseModel):
    __tablename__ = "reviews"

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=True)

    rating = Column(Float, nullable=False)          # 1-5
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)            # ["/uploads/reviews/img.jpg"]
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    reply = Column(Text, nullable=True)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    order_item = relationship("OrderItem", back_populates="reviews")

    @property
    def order_code(self):
        return self.order_item.order.order_code if (self.order_item and self.order_item.order) else None

    @property
    def product_color(self):
        if not self.order_item or not self.order_item.product_snapshot:
            return None
        return self.order_item.product_snapshot.get("color")

    @property
    def product_size(self):
        if not self.order_item:
            return None
        if self.order_item.product_snapshot:
            return self.order_item.product_snapshot.get("size")
        return self.order_item.variant.value if self.order_item.variant else None

    @property
    def order_status(self):
        return self.order_item.order.status.value if (self.order_item and self.order_item.order and hasattr(self.order_item.order.status, 'value')) else (self.order_item.order.status if (self.order_item and self.order_item.order) else None)

    @property
    def order_total(self):
        return self.order_item.order.total if (self.order_item and self.order_item.order) else None

    @property
    def order_date(self):
        return self.order_item.order.created_at if (self.order_item and self.order_item.order) else None

    @property
    def order_recipient_name(self):
        return self.order_item.order.shipping_address.get("full_name") if (self.order_item and self.order_item.order and self.order_item.order.shipping_address) else None

    @property
    def order_recipient_phone(self):
        return self.order_item.order.shipping_address.get("phone") if (self.order_item and self.order_item.order and self.order_item.order.shipping_address) else None

    @property
    def order_recipient_address(self):
        if not self.order_item or not self.order_item.order or not self.order_item.order.shipping_address:
            return None
        sa = self.order_item.order.shipping_address
        parts = [sa.get("address"), sa.get("ward"), sa.get("district"), sa.get("province")]
        return ", ".join([p for p in parts if p]) if any(parts) else sa.get("address")

    @property
    def order_payment_method(self):
        return self.order_item.order.payment_method.value if (self.order_item and self.order_item.order and hasattr(self.order_item.order.payment_method, 'value')) else (self.order_item.order.payment_method if (self.order_item and self.order_item.order) else None)

    @property
    def order_payment_status(self):
        return self.order_item.order.payment_status.value if (self.order_item and self.order_item.order and hasattr(self.order_item.order.payment_status, 'value')) else (self.order_item.order.payment_status if (self.order_item and self.order_item.order) else None)

    def __repr__(self):
        return f"<Review id={self.id} product_id={self.product_id} rating={self.rating}>"
