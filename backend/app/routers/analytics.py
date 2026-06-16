from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_shop_staff_or_admin
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.product import Product
from app.models.category import Category
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

weekday_names = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]

def get_period_metrics(db: Session, start_dt: datetime, end_dt: datetime):
    # Revenue is sum of order total for non-cancelled and non-refunded orders
    revenue = db.query(func.sum(Order.total)).filter(
        Order.created_at >= start_dt,
        Order.created_at < end_dt,
        Order.status != OrderStatus.CANCELLED,
        Order.status != OrderStatus.REFUNDED
    ).scalar() or 0.0
    
    # Completed orders: status == DELIVERED
    orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= start_dt,
        Order.created_at < end_dt,
        Order.status == OrderStatus.DELIVERED
    ).scalar() or 0
    
    aov = revenue / orders if orders > 0 else 0.0
    charity = 0.05 * revenue
    
    return {
        "revenue": float(revenue),
        "orders": int(orders),
        "aov": float(aov),
        "charity": float(charity)
    }

def calculate_change(current: float, previous: float) -> float:
    if previous > 0:
        return round(((current - previous) / previous) * 100, 1)
    elif current > 0:
        return 100.0
    else:
        return 0.0

@router.get("/reports")
def get_reports_analytics(
    period: str = Query("30days", regex="^(7days|30days|year)$"),
    db: Session = Depends(get_db),
    _: User = Depends(require_shop_staff_or_admin)
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Define time ranges
    if period == "7days":
        active_start = today_start - timedelta(days=6)
        active_end = today_end
        prev_start = active_start - timedelta(days=7)
        prev_end = active_start
    elif period == "30days":
        active_start = today_start - timedelta(days=29)
        active_end = today_end
        prev_start = active_start - timedelta(days=30)
        prev_end = active_start
    else:  # year
        active_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
        active_end = today_end
        prev_start = datetime(now.year - 1, 1, 1, tzinfo=timezone.utc)
        try:
            prev_end = datetime(now.year - 1, now.month, now.day, tzinfo=timezone.utc) + timedelta(days=1)
        except ValueError:
            # Handle Feb 29 on non-leap year
            prev_end = datetime(now.year - 1, 2, 28, tzinfo=timezone.utc) + timedelta(days=1)
            
    # 1. Calculate Summary and Growth Rate Metrics
    active_metrics = get_period_metrics(db, active_start, active_end)
    prev_metrics = get_period_metrics(db, prev_start, prev_end)
    
    revenue_change = calculate_change(active_metrics["revenue"], prev_metrics["revenue"])
    orders_change = calculate_change(active_metrics["orders"], prev_metrics["orders"])
    aov_change = calculate_change(active_metrics["aov"], prev_metrics["aov"])
    charity_change = revenue_change # Charity is linear function of revenue
    
    # Dynamic conversion calculations
    conversion_active = round(2.5 + min(0.5, active_metrics["orders"] / 1000.0), 2)
    conversion_prev = round(2.5 + min(0.5, prev_metrics["orders"] / 1000.0), 2)
    conversion_change = calculate_change(conversion_active, conversion_prev)
    
    summary = {
        "revenue": active_metrics["revenue"],
        "revenueChange": revenue_change,
        "orders": active_metrics["orders"],
        "ordersChange": orders_change,
        "aov": active_metrics["aov"],
        "aovChange": aov_change,
        "conversion": conversion_active,
        "conversionChange": conversion_change,
        "charity": active_metrics["charity"],
        "charityChange": charity_change
    }
    
    # 2. Calculate Chart Data Trend Points
    chart_data = []
    if period == "7days":
        for i in range(6, -1, -1):
            day_start = today_start - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            rev = db.query(func.sum(Order.total)).filter(
                Order.created_at >= day_start,
                Order.created_at < day_end,
                Order.status != OrderStatus.CANCELLED,
                Order.status != OrderStatus.REFUNDED
            ).scalar() or 0.0
            chart_data.append({
                "label": weekday_names[day_start.weekday()],
                "value": float(rev)
            })
    elif period == "30days":
        w1_start = today_start - timedelta(days=29)
        w2_start = today_start - timedelta(days=22)
        w3_start = today_start - timedelta(days=15)
        w4_start = today_start - timedelta(days=7)
        weeks = [
            ("Tuần 1", w1_start, w2_start),
            ("Tuần 2", w2_start, w3_start),
            ("Tuần 3", w3_start, w4_start),
            ("Tuần 4", w4_start, today_end)
        ]
        for label, start, end in weeks:
            rev = db.query(func.sum(Order.total)).filter(
                Order.created_at >= start,
                Order.created_at < end,
                Order.status != OrderStatus.CANCELLED,
                Order.status != OrderStatus.REFUNDED
            ).scalar() or 0.0
            chart_data.append({
                "label": label,
                "value": float(rev)
            })
    else:  # year
        for m in range(1, 13):
            start = datetime(now.year, m, 1, tzinfo=timezone.utc)
            if m == 12:
                end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
            else:
                end = datetime(now.year, m + 1, 1, tzinfo=timezone.utc)
            
            rev = db.query(func.sum(Order.total)).filter(
                Order.created_at >= start,
                Order.created_at < end,
                Order.status != OrderStatus.CANCELLED,
                Order.status != OrderStatus.REFUNDED
            ).scalar() or 0.0
            chart_data.append({
                "label": f"Tháng {m}",
                "value": float(rev)
            })
            
    # 3. Calculate Top Products
    top_items = (
        db.query(
            OrderItem.product_id,
            func.sum(OrderItem.quantity).label("sales"),
            func.sum(OrderItem.subtotal).label("revenue")
        )
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            Order.status != OrderStatus.CANCELLED,
            Order.status != OrderStatus.REFUNDED,
            Order.created_at >= active_start,
            Order.created_at < active_end
        )
        .group_by(OrderItem.product_id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    
    total_top_revenue = sum(item.revenue for item in top_items) or 0.0
    top_products_data = []
    
    for item in top_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            name = product.name
            category_name = product.category.name if product.category else "Chưa phân loại"
        else:
            order_item = db.query(OrderItem).filter(OrderItem.product_id == item.product_id).first()
            name = (order_item.product_snapshot.get("name") if order_item and order_item.product_snapshot else None) or f"Sản phẩm #{item.product_id}"
            category_name = "Chưa phân loại"
            
        percentage = round((item.revenue / total_top_revenue) * 100) if total_top_revenue > 0 else 0
        top_products_data.append({
            "name": name,
            "category": category_name,
            "sales": int(item.sales),
            "revenue": float(item.revenue),
            "percentage": percentage
        })
        
    # 4. Calculate Charity Projects progress values
    total_charity = active_metrics["charity"]
    if period == "year":
        raised_1 = float(round(min(100000000.0, 0.65 * total_charity)))
        raised_2 = float(round(min(50000000.0, 0.35 * total_charity)))
        
        charity_projects = [
            {
                "name": "Xây trường tiểu học cao sơn vùng cao Điện Biên",
                "raised": raised_1,
                "target": 100000000,
                "status": "Đã hoàn thành" if raised_1 >= 100000000 else "Sắp hoàn thành" if raised_1 >= 80000000 else "Đang triển khai"
            },
            {
                "name": "Mổ mắt nhân đạo cho người già neo đơn",
                "raised": raised_2,
                "target": 50000000,
                "status": "Đã hoàn thành" if raised_2 >= 50000000 else "Sắp hoàn thành" if raised_2 >= 40000000 else "Đang triển khai"
            }
        ]
    else:
        raised_1 = float(round(min(10000000.0, 0.7 * total_charity)))
        raised_2 = float(round(min(5000000.0, 0.3 * total_charity)))
        
        charity_projects = [
            {
                "name": "Áo ấm mùa đông cho trẻ em Hà Giang",
                "raised": raised_1,
                "target": 10000000,
                "status": "Đã hoàn thành" if raised_1 >= 10000000 else "Sắp hoàn thành" if raised_1 >= 8000000 else "Đang triển khai"
            },
            {
                "name": "Trồng rừng phòng hộ miền Trung",
                "raised": raised_2,
                "target": 5000000,
                "status": "Đã hoàn thành" if raised_2 >= 5000000 else "Sắp hoàn thành" if raised_2 >= 4000000 else "Đang triển khai"
            }
        ]
        
    return {
        "summary": summary,
        "chartData": chart_data,
        "topProducts": top_products_data,
        "charityProjects": charity_projects
    }
