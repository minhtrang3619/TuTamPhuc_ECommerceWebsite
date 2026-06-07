from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[ProductResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    return [item.product for item in items]


@router.post("/{product_id}", status_code=201)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first()
    if existing:
        return {"message": "Đã có trong danh sách yêu thích"}

    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    return {"message": "Đã thêm vào danh sách yêu thích"}


@router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id,
    ).first()
    if item:
        db.delete(item)
        db.commit()
