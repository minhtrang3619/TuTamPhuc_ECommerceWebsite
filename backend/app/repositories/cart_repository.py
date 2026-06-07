from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.repositories.base import BaseRepository
from app.models.cart import Cart, CartItem


class CartRepository(BaseRepository[Cart]):
    def __init__(self, db: Session):
        super().__init__(Cart, db)

    def get_by_user_id(self, user_id: int) -> Optional[Cart]:
        return (
            self.db.query(Cart)
            .options(
                joinedload(Cart.items).joinedload(CartItem.product).joinedload("images"),
                joinedload(Cart.items).joinedload(CartItem.variant),
            )
            .filter(Cart.user_id == user_id)
            .first()
        )

    def get_or_create(self, user_id: int) -> Cart:
        cart = self.get_by_user_id(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        return cart

    def get_item(self, cart_id: int, item_id: int) -> Optional[CartItem]:
        return (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart_id, CartItem.id == item_id)
            .first()
        )

    def get_item_by_product(
        self, cart_id: int, product_id: int, variant_id: Optional[int] = None
    ) -> Optional[CartItem]:
        query = self.db.query(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        if variant_id:
            query = query.filter(CartItem.variant_id == variant_id)
        return query.first()
