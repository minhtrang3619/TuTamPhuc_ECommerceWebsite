import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles

from app.core.config import settings


class UploadService:
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_SIZE = settings.MAX_FILE_SIZE

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
