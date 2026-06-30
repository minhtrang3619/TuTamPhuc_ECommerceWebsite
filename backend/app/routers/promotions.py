from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.promotion import Promotion, PromotionStatus
from app.models.user import User
from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.schemas.pagination import PaginatedResponse
from app.core.dependencies import get_current_active_user, require_blog_editor

router = APIRouter()  # Reload backend

@router.get("", response_model=PaginatedResponse[PromotionResponse])
def get_promotions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[PromotionStatus] = None,
):
    query = db.query(Promotion)
    
    if search:
        query = query.filter(
            (Promotion.name.ilike(f"%{search}%")) |
            (Promotion.code.ilike(f"%{search}%"))
        )
        
    if status_filter:
        query = query.filter(Promotion.status == status_filter)
        
    total = query.count()
    
    # Sort by created_at desc (newest first)
    promotions = query.order_by(Promotion.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": promotions,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.post("", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
def create_promotion(
    promotion_in: PromotionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_blog_editor)
):
    # Check if code already exists
    existing = db.query(Promotion).filter(Promotion.code == promotion_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promotion code already exists"
        )
        
    promotion = Promotion(**promotion_in.model_dump())
    db.add(promotion)
    db.commit()
    db.refresh(promotion)
    return promotion

@router.put("/{promotion_id}", response_model=PromotionResponse)
def update_promotion(
    promotion_id: int,
    promotion_in: PromotionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_blog_editor)
):
    promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
        
    if promotion_in.code:
        # Check if new code exists
        existing = db.query(Promotion).filter(Promotion.code == promotion_in.code, Promotion.id != promotion_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Promotion code already exists"
            )
            
    update_data = promotion_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(promotion, field, value)
        
    db.commit()
    db.refresh(promotion)
    return promotion

@router.delete("/{promotion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promotion(
    promotion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_blog_editor)
):
    promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
        
    db.delete(promotion)
    db.commit()
