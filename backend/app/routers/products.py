from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime

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


@router.get("/stock-vouchers")
def list_stock_vouchers(
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    from app.models.product import StockVoucher
    from datetime import datetime, timedelta
    vouchers = db.query(StockVoucher).order_by(StockVoucher.created_at.desc()).all()
    
    results = []
    now = datetime.now()
    changed = False
    for v in vouchers:
        expected_date = v.expected_delivery_date.replace(tzinfo=None) if v.expected_delivery_date else None
        created_at_naive = v.created_at.replace(tzinfo=None) if v.created_at else now
        
        target_status = v.delivery_status
        if expected_date and now >= expected_date:
            target_status = "Đã nhận"
        elif v.delivery_status != "Đã nhận":
            time_elapsed = now - created_at_naive
            if time_elapsed >= timedelta(days=1):
                target_status = "Đang vận chuyển"
            else:
                target_status = "Chờ lấy hàng"
                
        if v.delivery_status != target_status:
            v.delivery_status = target_status
            changed = True
            
    if changed:
        db.commit()
            
    for v in vouchers:
        results.append({
            "id": v.id,
            "voucher_code": v.voucher_code,
            "supplier": v.supplier,
            "notes": v.notes,
            "total_quantity": v.total_quantity,
            "total_value": v.total_value,
            "created_at": v.created_at,
            "delivery_duration_days": v.delivery_duration_days,
            "expected_delivery_date": v.expected_delivery_date,
            "delivery_status": v.delivery_status
        })
    return results


@router.get("/stock-vouchers/{voucher_id}")
def get_stock_voucher_detail(
    voucher_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    from app.models.product import StockVoucher, Product
    from datetime import datetime, timedelta
    
    voucher = db.query(StockVoucher).filter(StockVoucher.id == voucher_id).first()
    if not voucher:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu nhập kho")
        
    now = datetime.now()
    expected_date = voucher.expected_delivery_date.replace(tzinfo=None) if voucher.expected_delivery_date else None
    created_at_naive = voucher.created_at.replace(tzinfo=None) if voucher.created_at else now
    
    target_status = voucher.delivery_status
    if expected_date and now >= expected_date:
        target_status = "Đã nhận"
    elif voucher.delivery_status != "Đã nhận":
        time_elapsed = now - created_at_naive
        if time_elapsed >= timedelta(days=1):
            target_status = "Đang vận chuyển"
        else:
            target_status = "Chờ lấy hàng"
            
    if voucher.delivery_status != target_status:
        voucher.delivery_status = target_status
        db.commit()
            
    items_list = []
    for item in voucher.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        image_url = ""
        if product and product.images:
            primary = next((img.url for img in product.images if img.is_primary), product.images[0].url)
            image_url = primary
            
        items_list.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else "Sản phẩm",
            "product_image": image_url,
            "sku": item.sku,
            "quantity": item.quantity,
            "cost_price": item.cost_price,
            "color": item.color
        })
        
    return {
        "id": voucher.id,
        "voucher_code": voucher.voucher_code,
        "supplier": voucher.supplier,
        "recipient": voucher.recipient,
        "notes": voucher.notes,
        "total_quantity": voucher.total_quantity,
        "total_value": voucher.total_value,
        "created_at": voucher.created_at,
        "delivery_duration_days": voucher.delivery_duration_days,
        "expected_delivery_date": voucher.expected_delivery_date,
        "delivery_status": voucher.delivery_status,
        "items": items_list
    }


@router.put("/stock-vouchers/{voucher_id}/status")
def update_voucher_status(
    voucher_id: int,
    status: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write)
):
    from app.models.product import StockVoucher
    from datetime import datetime
    voucher = db.query(StockVoucher).filter(StockVoucher.id == voucher_id).first()
    if not voucher:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu nhập kho")
    
    valid_statuses = ["Chờ lấy hàng", "Đang vận chuyển", "Đã nhận"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")
        
    voucher.delivery_status = status
    if status == "Đã nhận":
        voucher.expected_delivery_date = datetime.now()
        
    db.commit()
    return {"message": "Cập nhật trạng thái thành công", "status": voucher.delivery_status}


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
    delivery_status: Optional[str] = "Chờ lấy hàng"
    delivery_duration_days: Optional[int] = 5
    expected_delivery_date: Optional[datetime] = None

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

    import random
    from datetime import datetime, timedelta
    duration_days = data.delivery_duration_days if data.delivery_duration_days is not None else 5
    if data.expected_delivery_date is not None:
        expected_date = data.expected_delivery_date
    else:
        expected_date = datetime.now() + timedelta(days=duration_days)

    # 2. Create StockVoucher
    voucher = StockVoucher(
        voucher_code=data.voucher_code.strip(),
        supplier=data.supplier.strip(),
        recipient=data.recipient.strip(),
        notes=data.notes.strip() if data.notes else None,
        total_quantity=0,
        total_value=0.0,
        delivery_status=data.delivery_status or "Chờ lấy hàng",
        expected_delivery_date=expected_date,
        delivery_duration_days=duration_days
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
            
            if item.color:
                color_val = None
                size_val = None
                if " - Size " in item.color:
                    parts = item.color.split(" - Size ")
                    color_val = parts[0].strip()
                    size_val = parts[1].strip()
                elif item.color.startswith("Size "):
                    size_val = item.color.replace("Size ", "").strip()
                else:
                    color_val = item.color.strip()
                    
                if color_val:
                    cv = db.query(ProductVariant).filter(
                        ProductVariant.product_id == product.id,
                        ProductVariant.name.in_(["Màu", "Color"]),
                        ProductVariant.value == color_val
                    ).first()
                    if cv:
                        cv.stock = (cv.stock or 0) + received_qty
                
                if size_val:
                    sv = db.query(ProductVariant).filter(
                        ProductVariant.product_id == product.id,
                        ProductVariant.name.in_(["Kích cỡ", "Size"]),
                        ProductVariant.value == size_val
                    ).first()
                    if sv:
                        sv.stock = (sv.stock or 0) + received_qty
            
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


class AuditReceiptItem(PydanticBaseModel):
    sku: str
    system_stock: int
    actual_stock: int
    discrepancy: int
    reason: Optional[str] = None
    color: Optional[str] = None

class StockAuditCreate(PydanticBaseModel):
    voucher_code: str
    auditor: str
    notes: Optional[str] = None
    items: List[AuditReceiptItem]

@router.get("/audit-vouchers")
def list_audit_vouchers(
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    from app.models.product import AuditVoucher
    vouchers = db.query(AuditVoucher).order_by(AuditVoucher.created_at.desc()).all()
    results = []
    for v in vouchers:
        results.append({
            "id": v.id,
            "voucher_code": v.voucher_code,
            "auditor": v.auditor,
            "notes": v.notes,
            "total_discrepancy": v.total_discrepancy,
            "created_at": v.created_at,
        })
    return results

@router.get("/audit-vouchers/{voucher_id}")
def get_audit_voucher_detail(
    voucher_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    from app.models.product import AuditVoucher, Product
    voucher = db.query(AuditVoucher).filter(AuditVoucher.id == voucher_id).first()
    if not voucher:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu kiểm kê")
        
    items_list = []
    for item in voucher.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        image_url = ""
        if product and product.images:
            primary = next((img.url for img in product.images if img.is_primary), product.images[0].url)
            image_url = primary
            
        items_list.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else "Sản phẩm đã bị xóa",
            "product_image": image_url,
            "sku": item.sku,
            "system_stock": item.system_stock,
            "actual_stock": item.actual_stock,
            "discrepancy": item.discrepancy,
            "reason": item.reason,
            "color": item.color,
        })
        
    return {
        "id": voucher.id,
        "voucher_code": voucher.voucher_code,
        "auditor": voucher.auditor,
        "notes": voucher.notes,
        "total_discrepancy": voucher.total_discrepancy,
        "created_at": voucher.created_at,
        "items": items_list
    }

@router.post("/audit-stock")
def audit_stock(
    data: StockAuditCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin_write),
):
    from app.models.product import Product, ProductVariant, AuditVoucher, AuditVoucherItem
    import logging

    existing = db.query(AuditVoucher).filter(AuditVoucher.voucher_code == data.voucher_code.strip()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Mã phiếu kiểm kê '{data.voucher_code}' đã tồn tại trong hệ thống."
        )

    voucher = AuditVoucher(
        voucher_code=data.voucher_code.strip(),
        auditor=data.auditor.strip(),
        notes=data.notes.strip() if data.notes else None,
        total_discrepancy=0
    )
    db.add(voucher)
    db.flush()

    total_disc = 0

    for item in data.items:
        product = db.query(Product).filter(Product.sku == item.sku.strip()).first()
        if not product:
            raise HTTPException(
                status_code=404, 
                detail=f"Sản phẩm có SKU '{item.sku}' không tồn tại trong hệ thống"
            )

        discrepancy = item.actual_stock - item.system_stock
        product.stock = max(0, product.stock + discrepancy)

        if item.color:
            color_val = None
            size_val = None
            if " - Size " in item.color:
                parts = item.color.split(" - Size ")
                color_val = parts[0].strip()
                size_val = parts[1].strip()
            elif item.color.startswith("Size "):
                size_val = item.color.replace("Size ", "").strip()
            else:
                color_val = item.color.strip()

            if color_val:
                cv = db.query(ProductVariant).filter(
                    ProductVariant.product_id == product.id,
                    ProductVariant.name.in_(["Màu", "Color"]),
                    ProductVariant.value == color_val
                ).first()
                if cv:
                    cv.stock = max(0, (cv.stock or 0) + discrepancy)

            if size_val:
                sv = db.query(ProductVariant).filter(
                    ProductVariant.product_id == product.id,
                    ProductVariant.name.in_(["Kích cỡ", "Size"]),
                    ProductVariant.value == size_val
                ).first()
                if sv:
                    sv.stock = max(0, (sv.stock or 0) + discrepancy)

        audit_item = AuditVoucherItem(
            voucher_id=voucher.id,
            product_id=product.id,
            sku=item.sku.strip(),
            system_stock=item.system_stock,
            actual_stock=item.actual_stock,
            discrepancy=discrepancy,
            reason=item.reason.strip() if item.reason else None,
            color=item.color if item.color else None
        )
        db.add(audit_item)
        total_disc += abs(discrepancy)

    voucher.total_discrepancy = total_disc
    db.commit()

    return {"message": "Kiểm kê kho hàng thành công", "voucher_id": voucher.id}


# Moved stock vouchers endpoints to be above wildcard slug endpoint



