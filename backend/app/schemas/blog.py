from typing import Optional, List
from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.user import UserBrief
from app.models.blog import BlogStatus


class BlogPostCreate(BaseSchema):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    thumbnail: Optional[str] = None
    status: BlogStatus = BlogStatus.DRAFT
    tags: Optional[List[str]] = None
    is_featured: bool = False


class BlogPostUpdate(BaseSchema):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    status: Optional[BlogStatus] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None


class BlogPostResponse(BaseSchema):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    thumbnail: Optional[str] = None
    author: UserBrief
    status: BlogStatus
    tags: Optional[List[str]] = None
    view_count: int
    is_featured: bool
    created_at: datetime
    updated_at: datetime


class PaginatedBlogPosts(BaseSchema):
    items: List[BlogPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
