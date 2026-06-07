import sys
import os

# Add the current directory to python path to resolve imports correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def seed_users():
    db = SessionLocal()
    try:
        # Delete old users with @tutamphuc.vn domain if they exist
        db.query(User).filter(User.email.like("%@tutamphuc.vn")).delete(synchronize_session=False)
        
        # 1. Create Admin User
        admin_email = "admin@gmail.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@123456"),
                full_name="Quản Trị Viên",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print(f"Created Admin account: {admin_email} / Admin@123456")
        else:
            print(f"Admin account already exists: {admin_email}")

        # 2. Create Customer User
        customer_email = "customer@gmail.com"
        customer_user = db.query(User).filter(User.email == customer_email).first()
        if not customer_user:
            customer_user = User(
                email=customer_email,
                hashed_password=get_password_hash("Customer@123456"),
                full_name="Khách Hàng Từ Tâm",
                role=UserRole.CUSTOMER,
                is_active=True
            )
            db.add(customer_user)
            print(f"Created Customer account: {customer_email} / Customer@123456")
        else:
            print(f"Customer account already exists: {customer_email}")

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
