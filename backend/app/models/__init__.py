# Import all models so Alembic can detect them
from app.models.base import BaseModel
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant, ProductStatus
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.cart import Cart, CartItem
from app.models.wishlist import WishlistItem
from app.models.review import Review
from app.models.blog import BlogPost, BlogStatus
from app.models.customer import Customer

__all__ = [
    "BaseModel",
    "User", "UserRole",
    "Category",
    "Product", "ProductImage", "ProductVariant", "ProductStatus",
    "Order", "OrderItem", "OrderStatus", "PaymentStatus", "PaymentMethod",
    "Cart", "CartItem",
    "WishlistItem",
    "Review",
    "BlogPost", "BlogStatus",
    "Customer",
]
