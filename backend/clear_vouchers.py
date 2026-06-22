import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.product import StockVoucher, StockVoucherItem

def clear_vouchers():
    db = SessionLocal()
    try:
        db.query(StockVoucherItem).delete()
        db.query(StockVoucher).delete()
        db.commit()
        print("Successfully cleared all stock vouchers and items from database.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing vouchers: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_vouchers()
