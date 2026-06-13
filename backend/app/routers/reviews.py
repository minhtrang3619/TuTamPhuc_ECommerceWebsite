import math
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_shop_staff_or_admin
from app.models.review import Review
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewResponse, PaginatedReviews, ReviewReply, AdminReviewResponse
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

    # Check if already reviewed for this order item
    if data.order_item_id:
        existing_item_review = db.query(Review).filter(
            Review.order_item_id == data.order_item_id
        ).first()
        if existing_item_review:
            raise HTTPException(status_code=400, detail="Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi")
    else:
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
    if review.order_item_id:
        review.is_verified_purchase = True
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


@router.get("/admin/reviews", response_model=List[AdminReviewResponse])
def get_all_reviews_admin(
    status: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shop_staff_or_admin),
):
    query = db.query(Review)
    if status == "pending":
        query = query.filter((Review.reply == None) | (Review.reply == ""))
    elif status == "replied":
        query = query.filter((Review.reply != None) & (Review.reply != ""))

    if rating is not None:
        query = query.filter(Review.rating == rating)

    reviews_list = query.order_by(Review.created_at.desc()).all()

    res = []
    for r in reviews_list:
        p_name = r.product.name if r.product else "Sản phẩm"
        p_image = r.product.images[0].url if (r.product and r.product.images) else None
        res.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": p_name,
            "product_image": p_image,
            "rating": r.rating,
            "title": r.title,
            "content": r.content,
            "is_anonymous": r.is_anonymous,
            "reply": r.reply,
            "order_code": r.order_code,
            "product_color": r.product_color,
            "product_size": r.product_size,
            "order_status": r.order_status,
            "order_total": r.order_total,
            "order_date": r.order_date,
            "order_recipient_name": r.order_recipient_name,
            "order_recipient_phone": r.order_recipient_phone,
            "order_recipient_address": r.order_recipient_address,
            "order_payment_method": r.order_payment_method,
            "order_payment_status": r.order_payment_status,
            "created_at": r.created_at,
            "user": r.user,
        })
    return res


@router.post("/reviews/{review_id}/reply", response_model=ReviewResponse)
def reply_to_review(
    review_id: int,
    data: ReviewReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shop_staff_or_admin),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")

    review.reply = data.reply
    db.commit()
    db.refresh(review)
    return review
