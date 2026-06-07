from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, PaginatedOrders
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Tạo đơn hàng từ giỏ hàng."""
    return OrderService(db).create_from_cart(current_user.id, data)


@router.get("/me", response_model=PaginatedOrders)
def my_orders(
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lấy danh sách đơn hàng của tôi."""
    return OrderService(db).get_user_orders(current_user.id, page)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return OrderService(db).get_by_id(order_id, current_user.id)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return OrderService(db).cancel_order(order_id, current_user.id)


# ── Admin endpoints ──────────────────────────────────────────
@router.get("", response_model=PaginatedOrders)
def admin_list_orders(
    page: int = Query(1, ge=1),
    order_status: str = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return OrderService(db).get_all_orders(page=page, order_status=order_status)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return OrderService(db).update_status(order_id, data.status)
