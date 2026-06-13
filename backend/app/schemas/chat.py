from typing import Optional, List, Any
from datetime import datetime
from app.schemas.base import BaseSchema


class ChatMessageCreate(BaseSchema):
    text: str
    product_info: Optional[dict] = None
    image_url: Optional[str] = None
    customer_id: Optional[int] = None  # Required if sent by staff/admin


class ChatMessageResponse(BaseSchema):
    id: int
    customer_id: int
    sender_id: int
    text: str
    product_info: Optional[dict] = None
    image_url: Optional[str] = None
    is_read: int
    created_at: datetime
    updated_at: datetime


class RecentOrderBrief(BaseSchema):
    id: str
    status: str
    item: str
    price: str


class ConversationResponse(BaseSchema):
    id: int
    name: str
    initials: str
    lastMessage: str
    time: str
    unread: bool
    avatar: Optional[str] = None
    statusText: Optional[str] = None
    tier: str
    email: str
    phone: str
    address: str
    recentOrders: List[RecentOrderBrief] = []
    messages: List[ChatMessageResponse] = []
