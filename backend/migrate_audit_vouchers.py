import sys
import os

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from sqlalchemy import text

db = SessionLocal()
try:
    with engine.connect() as conn:
        print("Checking and adding stock_voucher_id column to audit_vouchers table...")
        # For PostgreSQL, check if the column exists first, or just run ADD COLUMN IF NOT EXISTS
        conn.execute(text("ALTER TABLE audit_vouchers ADD COLUMN IF NOT EXISTS stock_voucher_id INTEGER REFERENCES stock_vouchers(id) ON DELETE SET NULL;"))
        conn.commit()
    print("Database altered successfully. Column stock_voucher_id added to audit_vouchers table.")
except Exception as e:
    print("Migration Error:", e)
finally:
    db.close()
