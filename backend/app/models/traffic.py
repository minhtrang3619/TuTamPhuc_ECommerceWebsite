from sqlalchemy import Column, String, Integer
from app.models.base import BaseModel

class TrafficChannel(BaseModel):
    __tablename__ = "traffic_channels"

    channel_name = Column(String(100), unique=True, nullable=False, index=True)
    visit_count = Column(Integer, default=0, nullable=False)
