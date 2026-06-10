from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerUpdate

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin, require_super_admin
from app.models.user import User, UserRole
from app.schemas.user import UserPublic, UserUpdate, ChangePassword
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/me", response_model=UserPublic)
def update_profile(
    data: UserUpdate,
    customer_data: CustomerUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin cá nhân và thông tin khách hàng chi tiết."""
    # Cập nhật User fields
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)

    # Cập nhật hoặc tạo Customer
    if current_user.customer:
        for f, v in customer_data.model_dump(exclude_none=True).items():
            setattr(current_user.customer, f, v)
    else:
        # Check if customer record already exists by email
        email_to_check = current_user.email
        existing_customer = db.query(Customer).filter(Customer.email == email_to_check).first()
        if existing_customer:
            current_user.customer_id = existing_customer.id
            for f, v in customer_data.model_dump(exclude_none=True).items():
                setattr(existing_customer, f, v)
        else:
            c_dict = customer_data.model_dump()
            if not c_dict.get("full_name"):
                c_dict["full_name"] = current_user.full_name
            if not c_dict.get("email"):
                c_dict["email"] = current_user.email
            new_customer = Customer(**c_dict)
            db.add(new_customer)
            db.flush()
            current_user.customer_id = new_customer.id

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Đổi mật khẩu."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công"}


# ── Admin endpoints ──────────────────────────────────────────
@router.get("", response_model=List[UserPublic])
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: Lấy danh sách người dùng."""
    return db.query(User).offset((page - 1) * page_size).limit(page_size).all()


@router.patch("/{user_id}/role", response_model=UserPublic)
def update_user_role(
    user_id: int,
    role: UserRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    """Super admin: Thay đổi role người dùng."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/toggle-active", response_model=UserPublic)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: Kích hoạt/vô hiệu hóa tài khoản."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
