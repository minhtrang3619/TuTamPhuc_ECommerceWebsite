import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.charity import CharityCampaign, CharityTransaction
from app.models.order import Order, OrderStatus
from sqlalchemy import func

def seed_charity():
    db = SessionLocal()
    try:
        print("Starting charity seeding...")
        
        # 1. Check if campaigns exist. If not, seed them.
        campaign_count = db.query(func.count(CharityCampaign.id)).scalar() or 0
        campaign_hagiang = None
        campaign_bode = None
        
        if campaign_count == 0:
            print("Seeding initial charity campaigns...")
            campaign_hagiang = CharityCampaign(
                name="Xây trường cho em - Hà Giang",
                description="Xây dựng 3 phòng học và thư viện cho các em nhỏ tại bản vùng cao, giúp trẻ em tiếp cận tri thức.",
                target_amount=600000000.0,
                raised_amount=450000000.0,
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuD44NCHdAlB89JBgcx1FJN5wI_vbtRUPi_kBf2a1i0RTAparQycMceuOeLLxjzLHn10p2CLUpZcXQW8gys_0p7HXnHpwWO5wug0aTAFY09QssGvGb8aLdg4LamUEbe1yqmFGTKniyYuXrhRsnaZIhUp9iWY6R67Pme7-rBSI9onOCtbT1sGIa4hxELdHv84OyP1Ll24Ei-2luPcfp5bvGHEZTr720cjFVttv-eFuDmr3BiZeWgA4e3KIrA0iz7J6__X_DXqwXj38r-4",
                status="active"
            )
            campaign_bode = CharityCampaign(
                name="Bữa cơm nhân ái - Chùa Bồ Đề",
                description="Cung cấp 500 suất cơm chay mỗi ngày cho các cụ già neo đơn và người vô gia cư tại khu vực ngoại ô.",
                target_amount=200000000.0,
                raised_amount=184000000.0,
                image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuCLNFI1Z0UaaKnK4Pzqaj7O1uUCaOMfx-ErfYtp3ja0fFHeoMgaP8jdXM5xIOjpdgsh7M1chJFJj_8dDDqXWpNJ-KsU9zsKU9IBZXWjlbDU49JB2v0yW9-Hh6QJCflN_jraHc6ZGueTyjBalOAGQovFJY2X0qzvgKbET8zlU3LNq6AL3p4Tzr3OngihbEq-WbKPjlM0PQ7JAgOPXRmYL-pn3qCRBkgvHb-DmV_CcA4f3o_P1gQ1w6n-8tSFTGo-xcP6Eq4Tf5kRAVQq",
                status="closing"
            )
            db.add(campaign_hagiang)
            db.add(campaign_bode)
            db.flush() # Get IDs
            
            # Add initial matching donation transactions for campaigns
            db.add(CharityTransaction(
                campaign_id=campaign_hagiang.id,
                donor_recipient="Cộng đồng Từ Tâm Phục",
                amount=450000000.0,
                transaction_type="donation",
                description="Ủng hộ khởi tạo chiến dịch Xây trường cho em - Hà Giang"
            ))
            db.add(CharityTransaction(
                campaign_id=campaign_bode.id,
                donor_recipient="Cộng đồng Từ Tâm Phục",
                amount=184000000.0,
                transaction_type="donation",
                description="Ủng hộ khởi tạo chiến dịch Bữa cơm nhân ái - Chùa Bồ Đề"
            ))
            
            # Add historical disbursements (expenses)
            db.add(CharityTransaction(
                campaign_id=campaign_hagiang.id,
                donor_recipient="Cửa hàng Vật liệu Xây dựng H.G",
                amount=-45200000.0,
                transaction_type="expense",
                description="Thanh toán tiền xi măng GĐ 1 - Dự án Hà Giang"
            ))
            db.add(CharityTransaction(
                campaign_id=campaign_bode.id,
                donor_recipient="Đại diện Quỹ Từ Tâm Phục",
                amount=-12800000.0,
                transaction_type="expense",
                description="Mua thực phẩm dự án Bữa cơm nhân ái"
            ))
            print("Initial campaigns and transactions seeded.")
        else:
            campaign_hagiang = db.query(CharityCampaign).first()
            print("Campaigns already exist, skipping initial seed.")

        # 2. Backfill transactions for existing delivered orders
        delivered_orders = db.query(Order).filter(Order.status == OrderStatus.DELIVERED).all()
        backfilled_count = 0
        for order in delivered_orders:
            # Check if a charity transaction for this order code already exists
            exists = db.query(CharityTransaction).filter(
                CharityTransaction.description.like(f"%#{order.order_code}%")
            ).first()
            
            if not exists:
                donation_amount = order.total * 0.05
                db_tx = CharityTransaction(
                    campaign_id=None,
                    donor_recipient=order.shipping_address.get("full_name", f"Đơn hàng #{order.order_code}"),
                    amount=donation_amount,
                    transaction_type="donation",
                    description=f"Trích 5% doanh số từ đơn hàng #{order.order_code}"
                )
                db.add(db_tx)
                backfilled_count += 1
                
        db.commit()
        print(f"Backfilled {backfilled_count} transactions for existing delivered orders.")
        print("Charity seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print("Error during seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_charity()
