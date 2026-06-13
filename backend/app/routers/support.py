from typing import List, Optional
import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin_or_customer_service
from app.models.user import User
from app.models.support_ticket import SupportTicket
from app.schemas.support import SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse

router = APIRouter(prefix="/support/tickets", tags=["Support Tickets"])


@router.post("", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Khách hàng tạo yêu cầu hỗ trợ mới."""
    # Generate unique ticket_code
    code_found = True
    ticket_code = ""
    while code_found:
        ticket_code = f"TKT-{random.randint(1000, 9999)}"
        existing = db.query(SupportTicket).filter(SupportTicket.ticket_code == ticket_code).first()
        if not existing:
            code_found = False

    new_ticket = SupportTicket(
        ticket_code=ticket_code,
        user_id=current_user.id,
        subject=payload.subject,
        description=payload.description,
        category=payload.category,
        priority=payload.priority or "medium",
        status="pending",
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@router.get("/my", response_model=List[SupportTicketResponse])
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Khách hàng xem danh sách yêu cầu hỗ trợ của mình."""
    return db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()


@router.get("", response_model=List[SupportTicketResponse])
def get_all_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_customer_service),
):
    """CSKH/Admin xem toàn bộ danh sách yêu cầu hỗ trợ."""
    query = db.query(SupportTicket)
    if status_filter and status_filter != "all":
        query = query.filter(SupportTicket.status == status_filter)
    return query.order_by(SupportTicket.created_at.desc()).all()


@router.put("/{ticket_id}", response_model=SupportTicketResponse)
def update_ticket(
    ticket_id: int,
    payload: SupportTicketUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_customer_service),
):
    """CSKH/Admin cập nhật trạng thái hoặc độ ưu tiên của yêu cầu hỗ trợ."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Yêu cầu hỗ trợ không tồn tại")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)
    return ticket
