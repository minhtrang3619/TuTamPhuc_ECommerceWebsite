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
def get_me(current_user: User = Depends(get_current_user)):
    """Lấy thông tin người dùng hiện tại."""
    return current_user
