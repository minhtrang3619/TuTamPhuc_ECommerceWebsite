from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
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


@router.patch("/sku/{sku}/quick-update", response_model=ProductResponse)
def quick_update_product_by_sku(
    sku: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shop_staff_or_admin_write),
):
    """Cập nhật nhanh kho hàng và trạng thái hiển thị của sản phẩm bằng SKU."""
    from app.models.product import Product, ProductVariant
    product = db.query(Product).filter(Product.sku == sku).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại với SKU này")
    
    # 1. Update variants if provided
    has_sizes = False
    total_stock = 0
    if data.variants is not None:
        db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
        for v in data.variants:
            variant = ProductVariant(product_id=product.id, **v.model_dump())
            db.add(variant)
            if v.name in ["Kích cỡ", "Size", "size"]:
                total_stock += v.stock
                has_sizes = True
        
        if has_sizes:
            product.stock = total_stock
            # Log the change: "User SHOP_STAFF updated SKU X to quantity Y"
            log_msg = f"User SHOP_STAFF updated SKU {sku} to quantity {total_stock}"
            print(log_msg)
            import logging
            logging.getLogger("app.routers.products").info(log_msg)

    # 2. Update stock if provided and variants not updated with sizes
    if data.stock is not None and not has_sizes:
        product.stock = data.stock
        # Log the change: "User SHOP_STAFF updated SKU X to quantity Y"
        log_msg = f"User SHOP_STAFF updated SKU {sku} to quantity {data.stock}"
        print(log_msg)
        import logging
        logging.getLogger("app.routers.products").info(log_msg)
        
    # 3. Update price if provided
    if data.price is not None:
        product.price = data.price
        
    # 4. Update status if provided
    if data.status is not None:
        product.status = data.status
        
    db.commit()
    db.refresh(product)
    return product


from pydantic import BaseModel as PydanticBaseModel
from typing import List

class StockReceiptItem(PydanticBaseModel):
    sku: str
    quantity: int
    cost_price: float
    color: Optional[str] = None

class StockReceiptCreate(PydanticBaseModel):
    voucher_code: str
    supplier: str
    recipient: str
    notes: Optional[str] = None
    items: List[StockReceiptItem]

@router.post("/receive-stock")
def receive_stock(
    data: StockReceiptCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write),
):
    from app.models.product import Product, ProductVariant, StockVoucher, StockVoucherItem
    import logging
    
    # 1. Check if voucher_code already exists
    existing = db.query(StockVoucher).filter(StockVoucher.voucher_code == data.voucher_code.strip()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Mã phiếu nhập kho '{data.voucher_code}' đã tồn tại trong hệ thống."
        )

    # 2. Create StockVoucher
    voucher = StockVoucher(
        voucher_code=data.voucher_code.strip(),
        supplier=data.supplier.strip(),
        recipient=data.recipient.strip(),
        notes=data.notes.strip() if data.notes else None,
        total_quantity=0,
        total_value=0.0
    )
    db.add(voucher)
    db.flush() # to get voucher.id

    total_qty = 0
    total_val = 0.0

    for item in data.items:
        # Search main product SKU
        product = db.query(Product).filter(Product.sku == item.sku.strip()).first()
        variant = None
        if not product:
            # Search variant SKU
            variant = db.query(ProductVariant).filter(ProductVariant.sku == item.sku.strip()).first()
            if variant:
                product = variant.product
            else:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Sản phẩm hoặc biến thể có SKU '{item.sku}' không tồn tại trong hệ thống"
                )
        
        current_stock = product.stock
        current_cost = product.cost_price or 0.0
        received_qty = item.quantity
        batch_cost = item.cost_price
        
        if current_stock + received_qty <= 0:
            new_cost = batch_cost
        elif current_stock <= 0:
            new_cost = batch_cost
        else:
            new_cost = (current_stock * current_cost + received_qty * batch_cost) / (current_stock + received_qty)
            
        if variant:
            variant.stock = variant.stock + received_qty
            product.stock = current_stock + received_qty
            
            color_variants = db.query(ProductVariant).filter(
                ProductVariant.product_id == product.id,
                ProductVariant.name == "Màu"
            ).all()
            for cv in color_variants:
                cv.stock = product.stock
        else:
            product.stock = current_stock + received_qty
            
        product.cost_price = round(new_cost, 2)
        
        # Save StockVoucherItem
        voucher_item = StockVoucherItem(
            voucher_id=voucher.id,
            product_id=product.id,
            sku=item.sku.strip(),
            quantity=received_qty,
            cost_price=batch_cost,
            color=item.color if hasattr(item, 'color') else None
        )
        db.add(voucher_item)

        total_qty += received_qty
        total_val += (received_qty * batch_cost)

        log_msg = f"User SHOP_STAFF received stock for SKU {item.sku}: quantity +{received_qty}, batch cost {batch_cost}, new average cost {product.cost_price}"
        print(log_msg)
        logging.getLogger("app.routers.products").info(log_msg)
        
    voucher.total_quantity = total_qty
    voucher.total_value = total_val

    db.commit()
    return {"message": "Nhập kho và cập nhật giá vốn trung bình thành công", "voucher_id": voucher.id}


@router.get("/stock-vouchers")
def list_stock_vouchers(
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    from app.models.product import StockVoucher
    vouchers = db.query(StockVoucher).order_by(StockVoucher.created_at.desc()).all()
    return vouchers


