from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.product import ProductResponse, PaginatedProducts
from app.services.product_service import ProductService
from app.core.dependencies import require_admin, require_shop_staff_or_admin, require_shop_staff_or_admin_write
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedProducts)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=1000),
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = Query("newest", enum=["newest", "price_asc", "price_desc", "popular", "rating"]),
    db: Session = Depends(get_db),
):
    """Lấy danh sách sản phẩm với filter và phân trang."""
    service = ProductService(db)
    return service.get_paginated(
        page=page, page_size=page_size, category_id=category_id,
        min_price=min_price, max_price=max_price, search=search, status=status, sort_by=sort_by,
    )


@router.get("/featured", response_model=list[ProductResponse])
def get_featured(db: Session = Depends(get_db)):
    """Lấy sản phẩm nổi bật."""
    return ProductService(db).get_featured()


@router.get("/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Lấy chi tiết sản phẩm theo slug."""
    return ProductService(db).get_by_slug(slug)


@router.get("/{product_id}/related", response_model=list[ProductResponse])
def get_related(product_id: int, db: Session = Depends(get_db)):
    """Lấy sản phẩm liên quan."""
    return ProductService(db).get_related(product_id)


# ── Admin & Staff endpoints ───────────────────────────────────
@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write),
):
    return ProductService(db).create(data)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write),
):
    return ProductService(db).update(product_id, data)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write),
):
    ProductService(db).delete(product_id)
