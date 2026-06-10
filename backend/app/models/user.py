import enum
from sqlalchemy import Column, String, Boolean, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    GUEST = "guest"
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"
    SHOP_STAFF = "shop_staff"
    CUSTOMER_SERVICE = "customer_service"


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar = Column(String(500), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    # New relationship to Customer
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True, unique=True)
    customer = relationship('Customer', uselist=False, backref='user')

    # Relationships
    orders = relationship("Order", back_populates="user", lazy="dynamic")
    cart = relationship("Cart", back_populates="user", uselist=False)
    wishlist_items = relationship("WishlistItem", back_populates="user", lazy="dynamic")
    reviews = relationship("Review", back_populates="user", lazy="dynamic")
    blog_posts = relationship("BlogPost", back_populates="author", lazy="dynamic")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
