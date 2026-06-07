from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.services.cart_service import CartService
from app.schemas.cart import CartResponse, AddToCartRequest, UpdateCartItemRequest
from app.models.user import User

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).get_cart(current_user.id)


@router.post("/items", response_model=CartResponse)
def add_item(
    data: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).add_item(current_user.id, data)


@router.patch("/items/{item_id}", response_model=CartResponse)
def update_item(
    item_id: int,
    data: UpdateCartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).update_item(current_user.id, item_id, data)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CartService(db).remove_item(current_user.id, item_id)


@router.delete("", status_code=204)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    CartService(db).clear_cart(current_user.id)
