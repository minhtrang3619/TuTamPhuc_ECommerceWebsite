from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CustomerBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    tier: Optional[str] = "Tiêu chuẩn"
    is_active: Optional[bool] = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    tier: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerRead(CustomerBase):
    id: int

    class Config:
        orm_mode = True
