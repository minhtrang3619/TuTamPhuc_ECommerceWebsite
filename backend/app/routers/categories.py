from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_admin
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithChildren
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryWithChildren])
def list_categories(db: Session = Depends(get_db)):
    """Lấy tất cả danh mục gốc kèm con."""
    return db.query(Category).filter(Category.parent_id == None).order_by(Category.sort_order).all()


@router.get("/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    return cat


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(Category).filter(Category.slug == data.slug).first():
        raise HTTPException(status_code=400, detail="Slug đã tồn tại")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    db.delete(cat)
    db.commit()
