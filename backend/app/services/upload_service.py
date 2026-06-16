import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles

from app.core.config import settings


class UploadService:
    ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
    MAX_SIZE = settings.MAX_FILE_SIZE

    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
    ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/3gpp"}
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB

    async def upload_media(self, file: UploadFile, folder: str = "reviews") -> str:
        """Upload image or video, return relative URL path."""
        content_type = file.content_type or ""
        if content_type in self.ALLOWED_IMAGE_TYPES:
            max_size = self.MAX_IMAGE_SIZE
        elif content_type in self.ALLOWED_VIDEO_TYPES:
            max_size = self.MAX_VIDEO_SIZE
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ chấp nhận các file ảnh hoặc video hợp lệ.",
            )

        contents = await file.read()
        if len(contents) > max_size:
            size_mb = max_size // 1024 // 1024
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File quá lớn. Tối đa {size_mb}MB",
            )

        ext = Path(file.filename or "file.jpg").suffix.lower()
        if not ext:
            if content_type.startswith("image/"):
                ext = ".jpg"
            else:
                ext = ".mp4"

        filename = f"{uuid.uuid4().hex}{ext}"
        save_dir = Path(settings.UPLOAD_DIR) / folder
        save_dir.mkdir(parents=True, exist_ok=True)
        save_path = save_dir / filename

        async with aiofiles.open(save_path, "wb") as f:
            await f.write(contents)

        return f"/uploads/{folder}/{filename}"

    async def upload_image(self, file: UploadFile, folder: str = "products") -> str:
        """Upload image, return relative URL path."""
        if file.content_type not in self.ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Chỉ chấp nhận file ảnh: {', '.join(self.ALLOWED_TYPES)}",
            )

        contents = await file.read()
        if len(contents) > self.MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File quá lớn. Tối đa {self.MAX_SIZE // 1024 // 1024}MB",
            )

        ext = Path(file.filename or "img.jpg").suffix.lower() or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        save_dir = Path(settings.UPLOAD_DIR) / folder
        save_dir.mkdir(parents=True, exist_ok=True)
        save_path = save_dir / filename

        async with aiofiles.open(save_path, "wb") as f:
            await f.write(contents)

        return f"/uploads/{folder}/{filename}"

    async def upload_multiple(self, files: list[UploadFile], folder: str = "products") -> list[str]:
        urls = []
        for file in files:
            url = await self.upload_image(file, folder)
            urls.append(url)
        return urls

    def delete_file(self, url: str) -> None:
        """Delete file by relative URL."""
        if not url:
            return
        file_path = Path(url.lstrip("/"))
        if file_path.exists():
            file_path.unlink()
