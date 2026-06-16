from typing import List
from fastapi import APIRouter, Depends, UploadFile, File

from app.core.dependencies import require_shop_staff_or_admin, get_current_user
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


@router.post("/return-evidence", response_model=dict)
async def upload_return_evidence(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload ảnh minh chứng trả hàng (dành cho khách hàng)."""
    service = UploadService()
    url = await service.upload_image(file, "returns")
    return {"url": url}


@router.post("/review-media", response_model=dict)
async def upload_review_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload hình ảnh/video đánh giá sản phẩm (dành cho khách hàng)."""
    service = UploadService()
    url = await service.upload_media(file, "reviews")
    return {"url": url, "type": "image" if file.content_type and file.content_type.startswith("image/") else "video"}


@router.post("/video", response_model=dict)
async def upload_single_video(
    file: UploadFile = File(...),
    folder: str = "products",
    _: User = Depends(require_shop_staff_or_admin),
):
    """Upload một video sản phẩm (dành cho quản trị viên)."""
    service = UploadService()
    url = await service.upload_media(file, folder)
    return {"url": url}
