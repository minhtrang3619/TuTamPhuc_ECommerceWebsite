from typing import Generic, TypeVar, List
from app.schemas.base import BaseSchema

T = TypeVar('T')

class PaginatedResponse(BaseSchema, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
