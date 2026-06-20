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
        
        # Ensure columns exist in database tables
        print("Ensuring columns exist in database tables...")
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS slogan VARCHAR(255)"))
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS gallery_images TEXT"))
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS content TEXT"))
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS quote VARCHAR(500)"))
        db.execute(text("ALTER TABLE charity_campaigns ADD COLUMN IF NOT EXISTS address VARCHAR(255)"))
        db.execute(text("ALTER TABLE charity_transactions ADD COLUMN IF NOT EXISTS order_code VARCHAR(50)"))
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
            image_url="https://lh3.googleusercontent.com/aida-public/AB6AXuBdeKbecYkznlSBSLLz09GVshQ9CPCluO1Wy19JmAxxQKtjEmUDthQHmEVWz0F2TnrSdhW2KYw82Vd8-5DEuv-2tSbj6A_AtRIn2nsT4-kfwRkZ9CPyHxic9Z9RD7HXyHGlgPSN33UTcZt0-rESfcrDk0mzpJoN5ontiUV3MuQ0DHA9PFb4qfAN0B4LW07f1paigeabyR-jDhhkI-p_P61lhq4rjXvMjW-gGcH65x0Hk2nM1PyWXYnamfS7anaN_YgepRupgF2OBUbD",
            status="active",
            gallery_images="https://lh3.googleusercontent.com/aida-public/AB6AXuDmgTqvtGLayp5gynaX-THb1e5lQCU-ZIevABluGx5vzuDAcXQSH0e8Hk-4HAPjXopP16YUrknTBl9UFHb93IwUaxBEsbWe7GS4JLj4l-yzWmSL9i9plsi3AZ5Qz79o5EYZf_TjfMwZRYYHxXuR5XvQUzd-HcXvqgiRCFF9M3kYdmHlNVoUQNKd-QxaO9I_is9LxlaQcwfebp02gZtmx7AJHfXcMCSbQ-N8YwHf-EIm_5roLb4irAF4xXiWH1VFJt9TKe1jVpxhuar4,https://lh3.googleusercontent.com/aida-public/AB6AXuDl38GVlNn6eUEho54DpTApF1S5eqqPcqJM0DyqiOJ0XKhcKZulIWjsWD_Fo-bD0bsUMu8vJNOIH4VyJf_qc85cWFC5pKraW97G17sKf_YdNCbkw5WTeCRujCCbk2pE9SYpGY7WaXaVYQuxrJebNFoRAJW6eAgukT0mQ0nE_cckm8VpkRElnwUhHUz6mPQ5YVwcBOSft91YsGouai6TnH13zShqMomeIIgcZMva5SlB43lcnEsb2SzEUUC_r2cIFG03DyJ5nU9lsQKs",
            content="Nằm sâu trong một con hẻm nhỏ tại huyện Nhà Bè, Chùa Lá Huyền Trang không chỉ là nơi tu tập, mà còn là mái nhà chung của hơn 100 cụ già không nơi nương tựa và trẻ em mồ côi. Mỗi sáng sớm, tiếng chuông chùa ngân vang như lời nhắc nhở về sự kết nối giữa những trái tim đồng điệu.\n\nTụi mình ghé thăm chùa vào một buổi chiều nắng nhạt. Chứng kiến đôi mắt trong veo của các em nhỏ khi nhận lấy chiếc bánh, hay nụ cười hiền hậu của các cụ khi có người trò chuyện, Từ Tâm Phục hiểu rằng: Sứ mệnh của chúng mình không chỉ là mang đến những bộ trang phục đẹp, mà còn là nhịp cầu gieo những hạt mầm thiện lành.\n\nDự án 'Hạt Lành Từ Tâm' ra đời với mong muốn cải thiện bữa ăn, cung cấp thuốc men và hỗ trợ chi phí sinh hoạt cho các cư dân tại mái ấm. Đây là một hành trình dài hơi, và mỗi bước chân của bạn đều có sự góp mặt của niềm tin và hy vọng.",
            quote="Hạnh phúc không phải là khi chúng ta nhận được nhiều, mà là khi chúng ta biết trao đi một phần nhỏ những gì mình có để sưởi ấm một cuộc đời khác.",
            address="1261/15/10 Lê Văn Lương, Ấp 2, Xã Phước Kiển, Huyện Nhà Bè, TP.HCM."
        )
        db.add(campaign)
        db.flush() # Get ID
        
        # 3. Backfill transactions for existing delivered orders
        delivered_orders = db.query(Order).filter(Order.status == OrderStatus.DELIVERED).all()
        backfilled_count = 0
        total_donation = 0.0
        
        DEFAULT_SEEDED_BLESSINGS = [
            "Gửi vạn điều an lành",
            "Gieo nhân lành, gặt quả ngọt. Chúc mái ấm luôn ngập tràn niềm vui.",
            "Gửi vạn điều lành và bình an đến các cụ già và em nhỏ.",
            "Mong các em thơ luôn vui vẻ, mạnh khỏe và bình an dưới bóng Phật đài."
        ]
        
        for idx, order in enumerate(delivered_orders):
            donation_amount = order.subtotal * 0.05
            is_anon = order.shipping_address.get("is_charity_anonymous", False)
            donor = "Khách hàng ẩn danh" if is_anon else order.shipping_address.get("full_name", "Khách hàng Từ Tâm Phục")
            blessing = order.shipping_address.get("charity_message") or order.notes or DEFAULT_SEEDED_BLESSINGS[idx % len(DEFAULT_SEEDED_BLESSINGS)]
            db_tx = CharityTransaction(
                campaign_id=campaign.id,
                donor_recipient=donor,
                amount=donation_amount,
                transaction_type="donation",
                description=blessing,
                order_code=order.order_code,
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
