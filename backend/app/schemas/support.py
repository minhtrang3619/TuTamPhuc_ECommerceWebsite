from pydantic import Field
from typing import Optional
from datetime import datetime
from app.schemas.base import BaseSchema, TimestampSchema
from app.schemas.user import UserBrief


class SupportTicketBase(BaseSchema):
    subject: str = Field(..., max_length=255)
    description: str = Field(...)
    category: str = Field(..., max_length=100)
    priority: str = Field("medium", max_length=20)
    status: str = Field("pending", max_length=20)


class SupportTicketCreate(BaseSchema):
    subject: str = Field(..., max_length=255)
    description: str = Field(...)
    category: str = Field(..., max_length=100)
    priority: Optional[str] = Field("medium", max_length=20)


class SupportTicketUpdate(BaseSchema):
    status: Optional[str] = Field(None, max_length=20)
    priority: Optional[str] = Field(None, max_length=20)


class SupportTicketResponse(SupportTicketBase, TimestampSchema):
    id: int
    ticket_code: str
    user_id: int
    user: Optional[UserBrief] = None
