from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.base import BaseSchema, TimestampSchema


class AddressBase(BaseSchema):
    name: str = Field(..., max_length=255)
    phone: str = Field(..., max_length=20)
    province: str = Field(..., max_length=255)
    district: str = Field(..., max_length=255)
    ward: str = Field(..., max_length=255)
    street: str = Field(..., max_length=255)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    province: Optional[str] = Field(None, max_length=255)
    district: Optional[str] = Field(None, max_length=255)
    ward: Optional[str] = Field(None, max_length=255)
    street: Optional[str] = Field(None, max_length=255)
    is_default: Optional[bool] = None


class AddressResponse(AddressBase, TimestampSchema):
    id: int
    user_id: int
