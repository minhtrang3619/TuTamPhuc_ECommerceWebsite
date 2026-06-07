import enum
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class BlogStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class BlogPost(BaseModel):
    __tablename__ = "blog_posts"

    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    thumbnail = Column(String(500), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(BlogStatus), default=BlogStatus.DRAFT, nullable=False)
    tags = Column(JSON, nullable=True)
    view_count = Column(Integer, default=0, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    author = relationship("User", back_populates="blog_posts")

    def __repr__(self):
        return f"<BlogPost id={self.id} title={self.title[:30]} status={self.status}>"
