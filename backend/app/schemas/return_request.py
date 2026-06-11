from typing import Optional, List
from datetime import datetime
from app.schemas.base import BaseSchema
from app.models.return_request import ReturnRequestStatus


class ReturnRequestCreate(BaseSchema):
    reason: str
    description: Optional[str] = None
    images: List[str]
    shipping_method: str
    bank_name: str
    account_number: str
    account_holder: str


class ReturnRequestUpdateStatus(BaseSchema):
    status: ReturnRequestStatus


class ReturnRequestResponse(BaseSchema):
    id: int
    order_id: int
    reason: str
    description: Optional[str] = None
    images: List[str]
    shipping_method: str
    bank_name: str
    account_number: str
    account_holder: str
    status: ReturnRequestStatus
    created_at: datetime
    updated_at: datetime
