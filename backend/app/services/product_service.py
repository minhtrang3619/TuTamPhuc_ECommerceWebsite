import math
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.models.product import Product, ProductImage, ProductVariant, ProductStatus
from app.schemas.product import ProductCreate, ProductUpdate, PaginatedProducts


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProductRepository(db)

    def get_paginated(
        self,
        page: int = 1,
        page_size: int = 12,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "newest",
    ) -> PaginatedProducts:
        items, total = self.repo.get_paginated(
            page=page,
            page_size=page_size,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            search=search,
            sort_by=sort_by,
        )
        return PaginatedProducts(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
        )

    def get_by_slug(self, slug: str) -> Product:
        product = self.repo.get_by_slug(slug)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sản phẩm",
            )
        # Increment view count
        product.view_count += 1
        self.repo.save()
        return product

    def get_featured(self) -> list:
        return self.repo.get_featured()

    def get_related(self, product_id: int) -> list:
        product = self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
        return self.repo.get_related(product)

    def create(self, data: ProductCreate) -> Product:
        # Check slug uniqueness
        existing = self.db.query(Product).filter(Product.slug == data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug đã tồn tại",
            )
        variants_data = data.variants or []
        product_dict = data.model_dump(exclude={"variants"})
        product = Product(**product_dict)
        self.db.add(product)
        self.db.flush()

        for v in variants_data:
            variant = ProductVariant(product_id=product.id, **v.model_dump())
            self.db.add(variant)

        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(product, field, value)
        return self.repo.update(product)

    def delete(self, product_id: int) -> None:
        product = self.repo.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
        self.repo.delete(product)
