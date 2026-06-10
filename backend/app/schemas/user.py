from pydantic import EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.user import UserRole
from app.schemas.customer import CustomerRead


# ── Request schemas ──────────────────────────────────────────
class UserRegister(BaseSchema):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Mật khẩu tối thiểu 6 ký tự")
        return v


class UserLogin(BaseSchema):
    email: EmailStr
    password: str


class UserUpdate(BaseSchema):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class ChangePassword(BaseSchema):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Mật khẩu tối thiểu 6 ký tự")
        return v


# ── Response schemas ─────────────────────────────────────────
class UserPublic(BaseSchema):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    role: UserRole
    is_active: bool
    customer: Optional[CustomerRead] = None
    created_at: datetime
    updated_at: datetime


class UserBrief(BaseSchema):
    """Minimal user info for embedding in other responses."""
    id: int
    full_name: str
    avatar: Optional[str] = None


# ── Auth tokens ──────────────────────────────────────────────
class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseSchema):
    refresh_token: str
