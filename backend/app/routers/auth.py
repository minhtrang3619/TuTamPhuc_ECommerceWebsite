from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserRegister, UserLogin, UserPublic, TokenResponse, RefreshTokenRequest
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới."""
    service = AuthService(db)
    return service.register(data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Đăng nhập và nhận access/refresh token."""
    service = AuthService(db)
    return service.login(data)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Làm mới access token bằng refresh token."""
    service = AuthService(db)
    return service.refresh(data)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Đăng xuất (client xoá token)."""
    return {"message": "Đăng xuất thành công"}


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lấy thông tin người dùng hiện tại."""
    if current_user.customer_id:
        from app.services import update_customer_tier
        update_customer_tier(db, current_user.customer_id)
        db.refresh(current_user)
    return current_user


from pydantic import BaseModel

class ForgotPasswordPhoneRequest(BaseModel):
    phone: str

@router.post("/forgot-password-phone")
def forgot_password_phone(data: ForgotPasswordPhoneRequest, db: Session = Depends(get_db)):
    """Cấp lại mật khẩu tạm thời qua số điện thoại."""
    from fastapi import HTTPException
    from app.core.security import get_password_hash
    import random
    import string
    
    phone = data.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Vui lòng nhập số điện thoại")
        
    # Search for user by phone
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        # Search via Customer phone number
        from app.models.customer import Customer
        customer = db.query(Customer).filter(Customer.phone == phone).first()
        if customer:
            user = db.query(User).filter(User.customer_id == customer.id).first()
            
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="Không tìm thấy tài khoản liên kết với số điện thoại này"
        )
        
    # Generate 6-digit random password
    new_password = "".join(random.choices(string.digits, k=6))
    
    # Hash and save password
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Log simulated SMS sending
    print(f"\n[SMS GATEWAY] Gửi SMS đến {phone}: Mat khau moi cua ban tai Tu Tam Phuc la: {new_password}\n")
    
    return {
        "success": True,
        "message": f"Mật khẩu mới đã được gửi tới số điện thoại {phone}.",
        "demo_password": new_password
    }
