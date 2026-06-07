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

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review id={self.id} product_id={self.product_id} rating={self.rating}>"
