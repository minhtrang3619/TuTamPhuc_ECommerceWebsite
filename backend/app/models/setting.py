from sqlalchemy import Column, String, Text
from app.models.base import BaseModel

class Setting(BaseModel):
    __tablename__ = "settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
