import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.product import Product, ProductImage, ProductVariant

def clear_products():
    db = SessionLocal()
    try:
        db.query(ProductVariant).delete()
        db.query(ProductImage).delete()
        db.query(Product).delete()
        db.commit()
        print("Successfully cleared all products, variants, and images from database.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_products()
