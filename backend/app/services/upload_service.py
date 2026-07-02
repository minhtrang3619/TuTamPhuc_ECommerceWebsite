import os
import uuid
import asyncio
from pathlib import Path
from fastapi import UploadFile, HTTPException, status

import cloudinary
import cloudinary.uploader

from app.core.config import settings

# Initialize cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

class UploadService:
    ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png"}
    MAX_SIZE = settings.MAX_FILE_SIZE

    ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png"}
    ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/3gpp"}
    MAX_IMAGE_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB

    async def upload_media(self, file: UploadFile, folder: str = "reviews") -> str:
        """Upload image or video to Cloudinary, return secure URL."""
        content_type = file.content_type or ""
        if content_type in self.ALLOWED_IMAGE_TYPES:
            max_size = self.MAX_IMAGE_SIZE
            resource_type = "image"
        elif content_type in self.ALLOWED_VIDEO_TYPES:
            max_size = self.MAX_VIDEO_SIZE
            resource_type = "video"
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

        try:
            response = await asyncio.to_thread(
                cloudinary.uploader.upload,
                contents,
                folder=f"tutamphuc/{folder}",
                resource_type=resource_type
            )
            return response.get("secure_url")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi upload lên Cloudinary: {str(e)}",
            )

    async def upload_image(self, file: UploadFile, folder: str = "products") -> str:
        """Upload image to Cloudinary, return secure URL."""
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

        try:
            response = await asyncio.to_thread(
                cloudinary.uploader.upload,
                contents,
                folder=f"tutamphuc/{folder}",
                resource_type="image"
            )
            return response.get("secure_url")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi upload ảnh lên Cloudinary: {str(e)}",
            )

    async def upload_multiple(self, files: list[UploadFile], folder: str = "products") -> list[str]:
        urls = []
        for file in files:
            url = await self.upload_image(file, folder)
            urls.append(url)
        return urls

    def delete_file(self, url: str) -> None:
        """Delete file by URL from Cloudinary or local disk."""
        if not url:
            return
        
        if "cloudinary.com" in url:
            try:
                parts = url.split("/upload/")
                if len(parts) == 2:
                    path_part = parts[1]
                    path_segments = path_part.split("/")
                    if path_segments[0].startswith("v") and path_segments[0][1:].isdigit():
                        path_segments = path_segments[1:]
                    
                    public_id_with_ext = "/".join(path_segments)
                    public_id = public_id_with_ext.rsplit(".", 1)[0]
                    
                    resource_type = "image"
                    if url.endswith((".mp4", ".webm", ".ogg")):
                        resource_type = "video"
                        
                    cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            except Exception as e:
                print(f"Failed to delete {url} from Cloudinary: {e}")
        else:
            file_path = Path(url.lstrip("/"))
            if file_path.exists():
                file_path.unlink()
