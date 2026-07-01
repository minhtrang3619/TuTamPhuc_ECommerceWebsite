import os
import sys
from sqlalchemy import create_engine, text

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

LOCAL_DB_URL = settings.DATABASE_URL
NEON_DB_URL = "postgresql://neondb_owner:npg_KA3YFR9WilOr@ep-noisy-bonus-ao4u1a7e.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Map of product slug to list of working image URLs
SLUG_IMAGE_MAP = {
    # 1. Đồ lam nữ
    "bo-do-lam-linen-theu-hoa-sen": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-i99PGuf24vO5kvxg326vEO7jUuUSLTDT1n1BFFVtkuE9CvzkafJf5hh_pcEax4jWWbA8r5usOW5XIpFoUHtnaRrkonr9-wyhvaXIZK6gTYY6CwI6RCABXDpyPxu0ioSb3YLij-kW940L0YDvEkFYvH3GPQ06avEx77w5QDj7YABPaI4R3UM1Xq76cZrNv2lXRxpAwWH_yy5LNgTcDPgOz-i4opUNNMKLgL6ksKfzWsqjN1LDhNOIe3L2WFbcei39HxceMvxge9Ov"
    ],
    "bo-do-lam-khuy-lech-theu-hoa-sen": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBAP3KJm44zDv1xLDp7lM9R_v24qof1kgdKtqX2e6DgMH8Ht7UiOcUlPKPO9ZGyMMZ4zLIUMYe8oxpvoCLfa9M8OUuLV_mZgHsC_90Sfl3ubBTfJ1Xsy15vlbGpSOzOxksALSeUuAEb7FoBUZr9TX1Ievc-gu6R5gLBxXeCNIUFPF4nV7V9YxC9JpeH-EE8h_JtzG9kwd0USgW1yO5geWCIOym71EwtYYzZiK9ypIpXKlIzV4nuD3EyzS4S2DJFHenPqeupT6cnD1BB"
    ],
    
    # 2. Đồ lam nam
    "bo-do-lam-nam-co-tau-nep-khuy-an-cao-cap": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2"
    ],
    "bo-do-lam-nam-vat-ho-xep-ly-cao-cap": [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    ],
    "bo-do-lam-nam-co-tau-khuy-ket-thu-cong": [
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80"
    ],
    
    # 3. Pháp phục nữ
    "bo-phap-phuc-khuy-lech-theu-hoa-sen": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDsIQym6pBS9548npqZ0goim9NHAV22TV3txuhEbomG3Q0hr2m6SF3TCsjzGLKEb8iQqEG7uW6Ygj5mku4jMzOhwhlkOVLUFJc7PvWgXxoi-gi70cvLNnqu593nTO5CXp2QnW68yFsN5cziye7vpIQl3H6dQ4x6QsMmcp3O-gzwfisPH_Py9x-hGN3PsMmHYTG6IrRk6TYORFXQLL5Z8hpcxPELuu2F2j8C79qn6g8qRSJfQtEi4bd_SDtaRjj6mPjDj_5pvGqxzyMv"
    ],
    "bo-phap-phuc-khuy-lech-theu-hoa-sen-sac-tue": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDUJFljnpOa2B9C7kBA4YrLTsNzLB2qxuf7m76WGV4gVLvw7raoS0UTeqQE_nRXa0z1mF9kGBhP1QksXgySgKASoAgn4E-enhpEbVqMsb-ULLQ85aVMRXuhdiMQ3_7dOc2RlL5dDQTYRmVokwzxCIQ7SdG_H2_UqMDIauB40P8z3Jn04eYTepIm39klCIlVR7noGxnFKwMfsWuMAW-tPP3-WzY7PcITdxL1K0_jtWmTY1qKyloRL6FysxIU-zhbZwZsdBHDTs6BKtO6"
    ],
    "bo-phap-phuc-gam-lua-theu-co-v-cao-cap": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCipQ_RDwv6eS7ad9qkllzjPcGtp-eT9utLCRPDhRYx9Kv_-wOBr8nMwvamhIMGtM4pmHO2F4xZzxv1OaFiGt2TAubOUrynCsM0B7MAzhcY7zEFL4-zI9R08SlxsmP4ZLJkyE4OUOtQ3ID2YYvT19Q2Ljw_GVoBDRZpDdTBPMxSz2SlYZ5J3p26K1h6TZWl--_slm26IxzeRWCcI4Ct7dwAU0nof3ycRK8uu_WqoPQa9IYTSq59TswpxPr4NKMOv9p4u8SQAIKDXfUg"
    ],
    
    # 4. Pháp phục nam
    "bo-phap-phuc-nam-co-v-phoi-hoa-tiet-tho-cam-cach-tan": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA71H9m0QdoZzVVRJgrWeq7OtlKQjvsOvfwW6e35CAnORnG06Yo2TqvCrZLiXXGUiQDH0W-vis2v6YgIQhZlCJUYckWiD9jWP6IoEk1ouOqWie0iCtD56F5Ig_83zQUw3NWTGBb11c82UBsqzujvFx0fHf7FMjrka3lGvqhwwz_kF2Cj1hg_wG3AlXOVEsrrtERPDyMRTSXuhytImF-qM5wm9Ua35KrH-FODsaCKtoUkrDBV810ZMNLgpJK6ux_y0DFoyzsdYB2escl"
    ],
    "bo-phap-phuc-nam-vat-cheo-phoi-hoa-tiet-van-may-co-dien": [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
    ],
    "bo-phap-phuc-nam-co-tau-theu-rong": [
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80"
    ],
    
    # 5. Áo tràng nam
    "ao-trang-nam-vat-ho-xep-ly": [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkWSlpPIPODRoiohVx_l6ZYVY8xkFuvZth6pCgpGjXJ3hFgf45Nyh9WlC-hs0Ma0EADm3-NtTyT4Y1q2XlEVT7XVATkDV-1456LM_LGIxRhITvdSvOylLbHIG_FkYI--mfVkxX-sb5fo53PxVUrFTk3meBb7VOavtUD5VYHs73K9e5c3c33nz5NMgWINRV8VUeWJmYtUkxIMsAYYilzMOZ7NdAgs4aqRnSWJOvZb9f1skrG9v5vqbVZNGWGgccivFepCmTH17j8aP"
    ]
}

def update_db(db_url, name):
    engine = create_engine(db_url)
    conn = engine.connect()
    trans = conn.begin()
    
    try:
        print(f"Updating image paths to working URLs on {name}...")
        
        for slug, urls in SLUG_IMAGE_MAP.items():
            # Get product ID by slug
            p_res = conn.execute(text("SELECT id, name FROM products WHERE slug = :slug"), {"slug": slug})
            product = p_res.fetchone()
            
            if not product:
                print(f" - Warning: Product with slug '{slug}' not found on {name} (skipped)")
                continue
                
            p_id, p_name = product
            p_name_safe = p_name.encode('ascii', 'ignore').decode('ascii')
            print(f" - Product '{p_name_safe}' (ID: {p_id}, Slug: {slug}):")
            
            # Delete old product images to avoid clutter
            conn.execute(text("DELETE FROM product_images WHERE product_id = :p_id"), {"p_id": p_id})
            
            # Insert working image URLs
            for index, url in enumerate(urls):
                is_primary = (index == 0)
                conn.execute(
                    text("""
                        INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at, updated_at) 
                        VALUES (:p_id, :url, :alt, :is_primary, :sort_order, NOW(), NOW())
                    """),
                    {
                        "p_id": p_id,
                        "url": url,
                        "alt": p_name,
                        "is_primary": is_primary,
                        "sort_order": index
                    }
                )
                print(f"   + Inserted working URL: {url}")
                
        trans.commit()
        print(f"SUCCESS: All product image URLs updated to working public paths on {name}!")
    except Exception as e:
        trans.rollback()
        error_safe = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"ERROR: During image updates on {name}: {error_safe}")
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    # Update local DB
    try:
        update_db(LOCAL_DB_URL, "Local DB")
    except Exception as local_err:
        print(f"Local DB update skipped/failed: {local_err}")
        
    # Update Neon DB
    update_db(NEON_DB_URL, "Neon DB")
