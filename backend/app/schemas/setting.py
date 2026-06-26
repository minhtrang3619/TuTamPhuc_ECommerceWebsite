from pydantic import BaseModel
from typing import Optional, List

class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None

class SettingInDB(SettingBase):
    id: int

    class Config:
        from_attributes = True

class SettingBatchUpdate(BaseModel):
    settings: List[SettingBase]
