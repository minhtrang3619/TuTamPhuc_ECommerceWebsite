import enum
from sqlalchemy import (
    Column, String, Text, Integer, Float,
    Boolean, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"


class Product(BaseModel):
    __tablename__ = "products"

    name = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    sale_price = Column(Float, nullable=True)
    sku = Column(String(100), unique=True, nullable=True)
    stock = Column(Integer, default=0, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    tags = Column(JSON, nullable=True)         # ["ao-trang", "mau-vang"]
    weight = Column(Float, nullable=True)      # grams
    rating_avg = Column(Float, default=0.0, nullable=False)
    rating_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", lazy="dynamic")

    def __repr__(self):
        return f"<Product id={self.id} name={self.name}>"


class ProductImage(BaseModel):
    __tablename__ = "product_images"

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String(500), nullable=False)
    alt = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductVariant(BaseModel):
    __tablename__ = "product_variants"

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    name = Column(String(100), nullable=False)   # "Màu", "Size"
    value = Column(String(100), nullable=False)  # "Vàng", "M"
    additional_price = Column(Float, default=0.0, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    sku = Column(String(100), nullable=True)

    product = relationship("Product", back_populates="variants")
