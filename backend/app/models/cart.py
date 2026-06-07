from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Cart(BaseModel):
    __tablename__ = "carts"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items)

    @property
    def subtotal(self) -> float:
        return sum(item.subtotal for item in self.items)

    def __repr__(self):
        return f"<Cart id={self.id} user_id={self.user_id}>"


class CartItem(BaseModel):
    __tablename__ = "cart_items"

    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)

    @property
    def subtotal(self) -> float:
        return self.price * self.quantity

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")
    variant = relationship("ProductVariant")
