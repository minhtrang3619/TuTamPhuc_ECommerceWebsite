import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# Reconfigure stdout to handle Vietnamese UTF-8 characters on Windows consoles
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

from app.database.session import SessionLocal
from app.models.charity import CharityCampaign, CharityTransaction
from app.models.order import Order, OrderStatus
from sqlalchemy import func, text

def seed_charity():
    db = SessionLocal()
    try:
        print("Starting charity seeding...")
        
        # Ensure 'slogan' column exists in database
        print("Ensuring 'slogan' column exists in 'charity_campaigns' table...")
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS slogan VARCHAR(255)"))
        db.commit()
        
        # 1. Clear all existing charity data to remove mock data
        print("Clearing existing charity campaigns and transactions...")
        db.query(CharityTransaction).delete()
        db.query(CharityCampaign).delete()
        db.commit()
        
        # 2. Create the exclusive single campaign
        print("Creating campaign 'Hạt Lành Từ Tâm'...")
        campaign = CharityCampaign(
            name="Hạt Lành Từ Tâm",
            slogan="Gieo hạt từ bi – Lan tỏa phúc lành.",
            description="Từ Tâm Phục cam kết trích 5% giá bán sản phẩm từ mỗi đơn hàng để quyên góp vào quỹ giúp đỡ người già neo đơn, trẻ mồ côi và những mảnh đời khó khăn cưu mang dưới bóng Phật đài.",
            target_amount=500000000.0,
            raised_amount=0.0,
            image_url="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000",
            status="active"
        )
        db.add(campaign)
        db.flush() # Get ID
        
        # 3. Backfill transactions for existing delivered orders
        delivered_orders = db.query(Order).filter(Order.status == OrderStatus.DELIVERED).all()
        backfilled_count = 0
        total_donation = 0.0
        
        for order in delivered_orders:
            donation_amount = order.subtotal * 0.05
            db_tx = CharityTransaction(
                campaign_id=campaign.id,
                donor_recipient=order.shipping_address.get("full_name", f"Đơn hàng #{order.order_code}"),
                amount=donation_amount,
                transaction_type="donation",
                description=f"Trích 5% doanh số từ đơn hàng #{order.order_code}",
                created_at=order.created_at
            )
            db.add(db_tx)
            total_donation += donation_amount
            backfilled_count += 1
            
        campaign.raised_amount = total_donation
        db.commit()
        
        print(f"Created campaign 'Hạt Lành Từ Tâm' and backfilled {backfilled_count} transactions.")
        print("Charity seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print("Error during seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_charity()
