import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.review import Review
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewResponse, PaginatedReviews
from app.models.user import User

router = APIRouter(tags=["Reviews"])


@router.get("/products/{product_id}/reviews", response_model=PaginatedReviews)
def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Review)
        .filter(Review.product_id == product_id, Review.is_approved == True)
        .order_by(Review.created_at.desc())
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedReviews(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=201)
def create_review(
    product_id: int,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")

    # Check if already reviewed
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá sản phẩm này rồi")

    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        **data.model_dump(),
    )
    db.add(review)

    # Update product rating
    reviews = db.query(Review).filter(Review.product_id == product_id, Review.is_approved == True).all()
    total_rating = sum(r.rating for r in reviews) + data.rating
    count = len(reviews) + 1
    product.rating_avg = round(total_rating / count, 1)
    product.rating_count = count

    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
    if review.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Không có quyền xoá đánh giá này")
    db.delete(review)
    db.commit()
