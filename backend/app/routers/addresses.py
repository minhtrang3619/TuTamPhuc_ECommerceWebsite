from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressResponse])
def get_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lấy danh sách địa chỉ của người dùng hiện tại."""
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.created_at.asc()).all()


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Thêm địa chỉ mới."""
    # Check if this is the first address, or if it is set as default
    existing_addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    
    is_default = data.is_default
    if not existing_addresses:
        is_default = True  # First address must be default
        
    if is_default:
        # Unset default for all other addresses
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    new_address = Address(
        user_id=current_user.id,
        name=data.name,
        phone=data.phone,
        province=data.province,
        district=data.district,
        ward=data.ward,
        street=data.street,
        is_default=is_default,
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cập nhật địa chỉ."""
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Địa chỉ không tồn tại")

    update_data = data.model_dump(exclude_unset=True)
    
    if "is_default" in update_data and update_data["is_default"]:
        # Unset default for all other addresses
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    
    for key, value in update_data.items():
        setattr(address, key, value)

    # If they are unsetting the default, check if we have any other address to set as default.
    # But usually one address must be default. So we enforce that if it is the only address, it must stay default.
    existing_count = db.query(Address).filter(Address.user_id == current_user.id).count()
    if existing_count == 1:
        address.is_default = True

    db.commit()
    db.refresh(address)
    return address


@router.patch("/{address_id}/set-default", response_model=AddressResponse)
def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Thiết lập địa chỉ mặc định."""
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Địa chỉ không tồn tại")

    # Unset all other default addresses
    db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    
    address.is_default = True
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Xóa địa chỉ."""
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Địa chỉ không tồn tại")

    was_default = address.is_default
    db.delete(address)
    db.commit()

    # If the deleted address was default, make another one default
    if was_default:
        next_address = db.query(Address).filter(Address.user_id == current_user.id).first()
        if next_address:
            next_address.is_default = True
            db.commit()

    return None
