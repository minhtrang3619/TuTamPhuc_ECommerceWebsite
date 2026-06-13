from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.product import Product, ProductStatus


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: Session):
        super().__init__(Product, db)

    def get_by_slug(self, slug: str) -> Optional[Product]:
        return (
            self.db.query(Product)
            .options(
                joinedload(Product.category),
                joinedload(Product.images),
                joinedload(Product.variants),
            )
            .filter(Product.slug == slug)
            .first()
        )

    def get_featured(self, limit: int = 8) -> List[Product]:
        return (
            self.db.query(Product)
            .options(joinedload(Product.images), joinedload(Product.category))
            .filter(
                Product.is_featured == True,
                Product.status == ProductStatus.ACTIVE,
            )
            .limit(limit)
            .all()
        )

    def get_paginated(
        self,
        page: int = 1,
        page_size: int = 12,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = "newest",
    ) -> Tuple[List[Product], int]:
        query = self.db.query(Product).options(
            joinedload(Product.images),
            joinedload(Product.category),
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
        if status:
            if status.lower() == "all":
                pass
            else:
                query = query.filter(Product.status == status)
        else:
            query = query.filter(Product.status == ProductStatus.ACTIVE)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "popular":
            query = query.order_by(Product.view_count.desc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating_avg.desc())
        else:  # newest
            query = query.order_by(Product.created_at.desc())

        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_related(self, product: Product, limit: int = 6) -> List[Product]:
        return (
            self.db.query(Product)
            .options(joinedload(Product.images))
            .filter(
                Product.category_id == product.category_id,
                Product.id != product.id,
                Product.status == ProductStatus.ACTIVE,
            )
            .limit(limit)
            .all()
        )
