from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.cart_repository import CartRepository
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import AddToCartRequest, UpdateCartItemRequest, CartResponse


class CartService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CartRepository(db)

    def get_cart(self, user_id: int) -> CartResponse:
        cart = self.repo.get_or_create(user_id)
        return self._build_response(cart)

    def add_item(self, user_id: int, data: AddToCartRequest) -> CartResponse:
        # Validate product exists and has stock
        product = self.db.query(Product).filter(Product.id == data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
        if product.stock < data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sản phẩm chỉ còn {product.stock} trong kho",
            )

        cart = self.repo.get_or_create(user_id)
        existing = self.repo.get_item_by_product(cart.id, data.product_id, data.variant_id)

        if existing:
            existing.quantity += data.quantity
        else:
            price = product.sale_price or product.price
            item = CartItem(
                cart_id=cart.id,
                product_id=data.product_id,
                variant_id=data.variant_id,
                quantity=data.quantity,
                price=price,
            )
            self.db.add(item)

        self.db.commit()
        cart = self.repo.get_by_user_id(user_id)
        return self._build_response(cart)

    def update_item(self, user_id: int, item_id: int, data: UpdateCartItemRequest) -> CartResponse:
        cart = self.repo.get_or_create(user_id)
        item = self.repo.get_item(cart.id, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Sản phẩm không có trong giỏ")

        if data.quantity <= 0:
            self.db.delete(item)
        else:
            item.quantity = data.quantity
        self.db.commit()

        cart = self.repo.get_by_user_id(user_id)
        return self._build_response(cart)

    def remove_item(self, user_id: int, item_id: int) -> CartResponse:
        cart = self.repo.get_or_create(user_id)
        item = self.repo.get_item(cart.id, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm trong giỏ")
        self.db.delete(item)
        self.db.commit()
        cart = self.repo.get_by_user_id(user_id)
        return self._build_response(cart)

    def clear_cart(self, user_id: int) -> None:
        cart = self.repo.get_by_user_id(user_id)
        if cart:
            for item in cart.items:
                self.db.delete(item)
            self.db.commit()

    def _build_response(self, cart) -> CartResponse:
        return CartResponse(
            id=cart.id,
            items=cart.items,
            total_items=sum(i.quantity for i in cart.items),
            subtotal=sum(i.price * i.quantity for i in cart.items),
        )
