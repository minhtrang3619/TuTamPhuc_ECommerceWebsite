import math
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.return_request import ReturnRequest, ReturnRequestStatus
from app.models.cart import Cart
from app.models.product import Product
from app.schemas.order import OrderCreate, PaginatedOrders
from app.schemas.return_request import ReturnRequestCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_order_code(self) -> str:
        return f"TTP-{uuid.uuid4().hex[:8].upper()}"

    def create_from_cart(self, user_id: int, data: OrderCreate) -> Order:
        discount = data.discount or 0.0
        shipping_fee = data.shipping_fee if data.shipping_fee is not None else 30000.0

        if data.items:
            # Create order from explicit items list
            subtotal = sum(item.price * item.quantity for item in data.items)
            total = max(0.0, subtotal + shipping_fee - discount)

            order = Order(
                order_code=self._generate_order_code(),
                user_id=user_id,
                shipping_address=data.shipping_address.model_dump(),
                payment_method=data.payment_method,
                notes=data.notes,
                coupon_code=data.coupon_code,
                subtotal=subtotal,
                discount=discount,
                shipping_fee=shipping_fee,
                total=total,
            )
            self.db.add(order)
            self.db.flush()

            for item in data.items:
                product = self.db.query(Product).filter(Product.id == item.product_id).first()
                if not product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Không tìm thấy sản phẩm có ID {item.product_id}",
                    )

                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    variant_id=None,
                    quantity=item.quantity,
                    price=item.price,
                    subtotal=item.price * item.quantity,
                    product_snapshot={
                        "name": product.name,
                        "image": product.images[0].url if product.images else None,
                        "color": item.color_name,
                        "color_hex": item.color_hex,
                        "size": item.size,
                    },
                )
                self.db.add(order_item)
                # Deduct stock
                product.stock -= item.quantity

            self.db.commit()
            self.db.refresh(order)
            return order

        # Default fallback to create from cart
        # Get user's cart
        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giỏ hàng trống",
            )

        subtotal = sum(item.price * item.quantity for item in cart.items)
        total = max(0.0, subtotal + shipping_fee - discount)

        order = Order(
            order_code=self._generate_order_code(),
            user_id=user_id,
            shipping_address=data.shipping_address.model_dump(),
            payment_method=data.payment_method,
            notes=data.notes,
            coupon_code=data.coupon_code,
            subtotal=subtotal,
            discount=discount,
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

    def get_by_id(self, order_id: int, user_id: int = None) -> Order:
        query = self.db.query(Order).filter(Order.id == order_id)
        if user_id is not None:
            query = query.filter(Order.user_id == user_id)
        order = query.first()
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
        return order

    def get_by_code(self, code: str, user_id: int = None) -> Order:
        query = self.db.query(Order).filter(Order.order_code == code)
        if user_id is not None:
            query = query.filter(Order.user_id == user_id)
        order = query.first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy đơn hàng",
            )
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

    def update_status(self, order_id: int, new_status: OrderStatus = None, new_payment_status: PaymentStatus = None) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
        
        old_status = order.status
        if new_status is not None:
            order.status = new_status
        if new_payment_status is not None:
            order.payment_status = new_payment_status
            
        # Add dynamic charity transaction of 5% total amount when order is delivered
        if new_status == OrderStatus.DELIVERED and old_status != OrderStatus.DELIVERED:
            from app.models.charity import CharityTransaction
            donation_amount = order.total * 0.05
            db_tx = CharityTransaction(
                campaign_id=None,
                donor_recipient=order.shipping_address.get("full_name", f"Đơn hàng #{order.order_code}"),
                amount=donation_amount,
                transaction_type="donation",
                description=f"Trích 5% doanh số từ đơn hàng #{order.order_code}"
            )
            self.db.add(db_tx)

        self.db.commit()
        self.db.refresh(order)
        return order

    def create_return_request(self, order_id: int, user_id: int, data: ReturnRequestCreate) -> ReturnRequest:
        order = self.db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy đơn hàng",
            )
        if order.status != OrderStatus.DELIVERED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ có thể yêu cầu trả hàng cho đơn hàng đã giao thành công",
            )
        if order.return_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đơn hàng này đã có yêu cầu trả hàng trước đó",
            )

        db_request = ReturnRequest(
            order_id=order.id,
            reason=data.reason,
            description=data.description,
            images=data.images,
            shipping_method=data.shipping_method,
            bank_name=data.bank_name,
            account_number=data.account_number,
            account_holder=data.account_holder,
            status=ReturnRequestStatus.PENDING,
        )
        self.db.add(db_request)
        self.db.commit()
        self.db.refresh(db_request)
        return db_request

    def get_return_requests(self, page: int = 1, page_size: int = 20) -> dict:
        query = self.db.query(ReturnRequest).order_by(ReturnRequest.created_at.desc())
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if total > 0 else 0,
        }

    def update_return_request_status(self, return_id: int, new_status: ReturnRequestStatus) -> ReturnRequest:
        db_request = self.db.query(ReturnRequest).filter(ReturnRequest.id == return_id).first()
        if not db_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy yêu cầu trả hàng",
            )
        db_request.status = new_status
        if new_status == ReturnRequestStatus.APPROVED:
            db_request.order.status = OrderStatus.REFUNDED
            db_request.order.payment_status = PaymentStatus.REFUNDED
            for item in db_request.order.items:
                if item.product:
                    item.product.stock += item.quantity
        self.db.commit()
        self.db.refresh(db_request)
        return db_request
