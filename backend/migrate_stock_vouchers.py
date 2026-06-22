import sys
import os
from datetime import datetime, timedelta

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from sqlalchemy import text

db = SessionLocal()
try:
    with engine.connect() as conn:
        print("Checking and adding columns to stock_vouchers table...")
        conn.execute(text("ALTER TABLE stock_vouchers ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(100) DEFAULT 'Chờ lấy hàng';"))
        conn.execute(text("ALTER TABLE stock_vouchers ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP;"))
        conn.execute(text("ALTER TABLE stock_vouchers ADD COLUMN IF NOT EXISTS delivery_duration_days INTEGER;"))
        conn.commit()
    print("Database columns altered successfully.")
    
    # Update existing vouchers with default computed values
    from app.models.product import StockVoucher
    vouchers = db.query(StockVoucher).all()
    print(f"Migrating {len(vouchers)} existing stock vouchers...")
    
    now = datetime.now()
    for v in vouchers:
        if v.delivery_duration_days is None:
            # Recreate previous projection formula
            v.delivery_duration_days = 3 + (v.id % 3)
            created = v.created_at.replace(tzinfo=None) if v.created_at else now
            v.expected_delivery_date = created + timedelta(days=v.delivery_duration_days)
            
            if now >= v.expected_delivery_date:
                v.delivery_status = "Đã giao"
            else:
                time_elapsed = now - created
                if time_elapsed < timedelta(days=1):
                    v.delivery_status = "Chờ lấy hàng"
                elif time_elapsed < timedelta(days=3):
                    v.delivery_status = "Đang vận chuyển"
                else:
                    v.delivery_status = "Dự kiến"
                    
    db.commit()
    print("Migration completed successfully.")
except Exception as e:
    db.rollback()
    print("Migration Error:", e)
finally:
    db.close()
