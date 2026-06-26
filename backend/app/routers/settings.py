from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.setting import Setting
from app.schemas.setting import SettingInDB, SettingBatchUpdate
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=List[SettingInDB])
def get_all_settings(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả cấu hình hệ thống (Public hoặc Admin đều có thể xem)."""
    return db.query(Setting).all()

@router.post("", response_model=List[SettingInDB])
def update_settings(
    data: SettingBatchUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Cập nhật nhiều cấu hình cùng lúc (Chỉ Admin)."""
    updated_settings = []
    for item in data.settings:
        setting = db.query(Setting).filter(Setting.key == item.key).first()
        if setting:
            setting.value = item.value
            if item.description:
                setting.description = item.description
        else:
            setting = Setting(key=item.key, value=item.value, description=item.description)
            db.add(setting)
        updated_settings.append(setting)
    
    db.commit()
    for setting in updated_settings:
        db.refresh(setting)
    return updated_settings
