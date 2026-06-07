import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.blog import BlogPost, BlogStatus
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse, PaginatedBlogPosts
from app.models.user import User

router = APIRouter(prefix="/blog", tags=["Blog"])


@router.get("", response_model=PaginatedBlogPosts)
def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(BlogPost).filter(BlogPost.status == BlogStatus.PUBLISHED).order_by(BlogPost.created_at.desc())
    if tag:
        query = query.filter(BlogPost.tags.contains([tag]))
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedBlogPosts(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{slug}", response_model=BlogPostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.status == BlogStatus.PUBLISHED).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tìm thấy")
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post


@router.post("", response_model=BlogPostResponse, status_code=201)
def create_post(
    data: BlogPostCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(BlogPost).filter(BlogPost.slug == data.slug).first():
        raise HTTPException(status_code=400, detail="Slug đã tồn tại")
    post = BlogPost(author_id=current_user.id, **data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostResponse)
def update_post(
    post_id: int,
    data: BlogPostUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    db.delete(post)
    db.commit()
