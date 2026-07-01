from typing import Optional
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.user import User
from app.models.order import Order, OrderStatus

def update_customer_tier(db: Session, customer_id: int) -> Optional[Customer]:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return None
        
    user = db.query(User).filter(User.customer_id == customer.id).first()
    if not user:
        if customer.tier != "":
            customer.tier = ""
            db.commit()
            db.refresh(customer)
        return customer
        
    # Count delivered orders
    delivered_orders_count = db.query(Order).filter(
        Order.user_id == user.id,
        Order.status == OrderStatus.DELIVERED
    ).count()
    
    if delivered_orders_count >= 20:
        new_tier = "Khách hàng Kim Cương"
    elif delivered_orders_count >= 10:
        new_tier = "Khách hàng Vàng"
    elif delivered_orders_count >= 5:
        new_tier = "Khách hàng Bạc"
    else:
        new_tier = ""
        
    if customer.tier != new_tier:
        customer.tier = new_tier
        db.commit()
        db.refresh(customer)
        
    return customer

def update_customer_tier_by_user_id(db: Session, user_id: int) -> Optional[Customer]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.customer_id:
        return None
    return update_customer_tier(db, user.customer_id)
