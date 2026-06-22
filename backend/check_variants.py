import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.database.session import SessionLocal
from app.models.product import Product, ProductVariant

db = SessionLocal()
try:
    print("Checking products and variants...")
    products = db.query(Product).all()
    for p in products[:5]:
        print(f"Product SKU: {p.sku}")
        variants = db.query(ProductVariant).filter(ProductVariant.product_id == p.id).all()
        for v in variants:
            print(f"  - Variant: {v.name} = {v.value} (SKU: {v.sku}, Stock: {v.stock})")
finally:
    db.close()
