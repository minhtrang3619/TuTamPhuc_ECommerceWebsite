from typing import List
from fastapi import APIRouter, Depends, UploadFile, File

from app.core.dependencies import require_shop_staff_or_admin
from app.services.upload_service import UploadService
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post("/image", response_model=dict)
async def upload_single_image(
    file: UploadFile = File(...),
    folder: str = "products",
    _: User = Depends(require_shop_staff_or_admin),
):
    """Upload một ảnh. Trả về URL."""
    service = UploadService()
    url = await service.upload_image(file, folder)
    return {"url": url}


@router.post("/images", response_model=dict)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    folder: str = "products",
    _: User = Depends(require_shop_staff_or_admin),
):
    """Upload nhiều ảnh cùng lúc. Trả về danh sách URL."""
    service = UploadService()
    urls = await service.upload_multiple(files, folder)
    return {"urls": urls}
