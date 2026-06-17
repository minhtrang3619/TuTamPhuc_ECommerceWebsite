from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class CharityCampaignBase(BaseModel):
    name: str
    slogan: Optional[str] = None
    description: Optional[str] = None
    target_amount: float
    image_url: Optional[str] = None
    status: Optional[str] = "active"

class CharityCampaignCreate(CharityCampaignBase):
    pass

class CharityCampaignUpdate(BaseModel):
    name: Optional[str] = None
    slogan: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class CharityCampaignResponse(CharityCampaignBase):
    id: int
    raised_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CharityTransactionBase(BaseModel):
    campaign_id: Optional[int] = None
    donor_recipient: str
    amount: float
    transaction_type: str
    description: Optional[str] = None

class CharityTransactionCreate(CharityTransactionBase):
    pass

class CharityTransactionResponse(CharityTransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CharityOverviewResponse(BaseModel):
    total_fund: float
    total_donations: int
    active_campaigns_count: int
    recent_transactions: List[CharityTransactionResponse]
