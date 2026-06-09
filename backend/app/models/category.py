from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    # Self-referential relationship
    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")

    # Products in this category
    products = relationship("Product", back_populates="category", lazy="dynamic")

    @property
    def product_count(self) -> int:
        return self.products.count()

    def __repr__(self):
        return f"<Category id={self.id} name={self.name}>"
