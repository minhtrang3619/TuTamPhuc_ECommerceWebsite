from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin, require_shop_staff_or_admin
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, PaginatedOrders
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestResponse, ReturnRequestUpdateStatus
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


@router.get("/code/{code}", response_model=OrderResponse)
def get_order_by_code(
    code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return OrderService(db).get_by_code(code, current_user.id)



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
    _: User = Depends(require_shop_staff_or_admin),
):
    return OrderService(db).get_all_orders(page=page, order_status=order_status)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin),
):
    return OrderService(db).update_status(
        order_id=order_id,
        new_status=data.status,
        new_payment_status=data.payment_status
    )


@router.post("/{order_id}/return", response_model=ReturnRequestResponse, status_code=201)
def create_return_request(
    order_id: int,
    data: ReturnRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Khách hàng gửi yêu cầu trả hàng / hoàn tiền."""
    return OrderService(db).create_return_request(
        order_id=order_id,
        user_id=current_user.id,
        data=data
    )


@router.get("/returns", response_model=dict)
def admin_list_return_requests(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin),
):
    """Admin xem danh sách yêu cầu trả hàng."""
    return OrderService(db).get_return_requests(page=page)


@router.patch("/returns/{return_id}/status", response_model=ReturnRequestResponse)
def update_return_request_status(
    return_id: int,
    data: ReturnRequestUpdateStatus,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin),
):
    """Admin duyệt / từ chối yêu cầu trả hàng."""
    return OrderService(db).update_return_request_status(
        return_id=return_id,
        new_status=data.status
    )
