import math
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import Cart
from app.schemas.order import OrderCreate, PaginatedOrders


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_order_code(self) -> str:
        return f"TTP-{uuid.uuid4().hex[:8].upper()}"

    def create_from_cart(self, user_id: int, data: OrderCreate) -> Order:
        # Get user's cart
        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giỏ hàng trống",
            )

        subtotal = sum(item.price * item.quantity for item in cart.items)
        shipping_fee = 30000.0  # flat rate, can be dynamic later
        total = subtotal + shipping_fee

        order = Order(
            order_code=self._generate_order_code(),
            user_id=user_id,
            shipping_address=data.shipping_address.model_dump(),
            payment_method=data.payment_method,
            notes=data.notes,
            coupon_code=data.coupon_code,
            subtotal=subtotal,
            discount=0.0,
            shipping_fee=shipping_fee,
            total=total,
        )
        self.db.add(order)
        self.db.flush()

        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                quantity=cart_item.quantity,
                price=cart_item.price,
                subtotal=cart_item.price * cart_item.quantity,
                product_snapshot={
                    "name": cart_item.product.name,
                    "image": cart_item.product.images[0].url if cart_item.product.images else None,
                },
            )
            self.db.add(order_item)
            # Deduct stock
            cart_item.product.stock -= cart_item.quantity

        # Clear cart
        for item in cart.items:
            self.db.delete(item)

        self.db.commit()
        self.db.refresh(order)
        return order

    def get_user_orders(self, user_id: int, page: int = 1, page_size: int = 10) -> PaginatedOrders:
        query = self.db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc())
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedOrders(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
        )

    def get_by_id(self, order_id: int, user_id: int) -> Order:
        order = self.db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id,
        ).first()
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        return order

    def cancel_order(self, order_id: int, user_id: int) -> Order:
        order = self.get_by_id(order_id, user_id)
        if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể huỷ đơn hàng ở trạng thái này",
            )
        order.status = OrderStatus.CANCELLED
        # Restore stock
        for item in order.items:
            item.product.stock += item.quantity
        self.db.commit()
        self.db.refresh(order)
        return order

    # Admin
    def get_all_orders(self, page: int = 1, page_size: int = 20, order_status: str = None) -> PaginatedOrders:
        query = self.db.query(Order).order_by(Order.created_at.desc())
        if order_status:
            query = query.filter(Order.status == order_status)
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return PaginatedOrders(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
        )

    def update_status(self, order_id: int, new_status: OrderStatus) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
        order.status = new_status
        self.db.commit()
        self.db.refresh(order)
        return order
