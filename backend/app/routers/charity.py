from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.core.dependencies import require_super_admin
from app.models.charity import CharityCampaign, CharityTransaction
from app.models.user import User
from app.schemas.charity import (
    CharityCampaignCreate, CharityCampaignUpdate, CharityCampaignResponse,
    CharityTransactionCreate, CharityTransactionResponse, CharityOverviewResponse
)

router = APIRouter(prefix="/charity", tags=["Charity"])

@router.get("/overview", response_model=CharityOverviewResponse)
def get_charity_overview(db: Session = Depends(get_db)):
    """Lấy tổng quan chỉ số quỹ thiện nguyện."""
    total_fund = db.query(func.sum(CharityTransaction.amount)).scalar() or 0.0
    total_donations = db.query(func.count(CharityTransaction.id)).filter(
        CharityTransaction.transaction_type == "donation"
    ).scalar() or 0
    
    active_campaigns_count = db.query(func.count(CharityCampaign.id)).filter(
        CharityCampaign.status == "active"
    ).scalar() or 0
    
    recent_transactions = db.query(CharityTransaction).order_by(
        CharityTransaction.created_at.desc()
    ).limit(10).all()
    
    return {
        "total_fund": float(total_fund),
        "total_donations": int(total_donations),
        "active_campaigns_count": int(active_campaigns_count),
        "recent_transactions": recent_transactions
    }

def populate_campaign_stats(db: Session, campaign: CharityCampaign) -> CharityCampaign:
    unique_donors = db.query(func.count(func.distinct(CharityTransaction.donor_recipient))).filter(
        CharityTransaction.campaign_id == campaign.id,
        CharityTransaction.transaction_type == "donation"
    ).scalar() or 0
    campaign.unique_donors_count = unique_donors
    return campaign

@router.get("/campaigns", response_model=list[CharityCampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    """Lấy danh sách các chiến dịch thiện nguyện."""
    campaigns = db.query(CharityCampaign).order_by(CharityCampaign.created_at.desc()).all()
    for c in campaigns:
        populate_campaign_stats(db, c)
    return campaigns

@router.post("/campaigns", response_model=CharityCampaignResponse, status_code=201)
def create_campaign(
    data: CharityCampaignCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    """Tạo chiến dịch thiện nguyện mới (Chỉ Admin)."""
    db_campaign = CharityCampaign(**data.model_dump())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return populate_campaign_stats(db, db_campaign)

@router.put("/campaigns/{campaign_id}", response_model=CharityCampaignResponse)
def update_campaign(
    campaign_id: int,
    data: CharityCampaignUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    """Cập nhật thông tin chiến dịch (Chỉ Admin)."""
    db_campaign = db.query(CharityCampaign).filter(CharityCampaign.id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Không tìm thấy chiến dịch")
        
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(db_campaign, key, val)
        
    # Recalculate status if raised/target changed
    if db_campaign.raised_amount >= db_campaign.target_amount:
        db_campaign.status = "completed"
    elif db_campaign.raised_amount >= 0.8 * db_campaign.target_amount:
        db_campaign.status = "closing"
        
    db.commit()
    db.refresh(db_campaign)
    return populate_campaign_stats(db, db_campaign)

@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    """Xoá chiến dịch thiện nguyện (Chỉ Admin)."""
    db_campaign = db.query(CharityCampaign).filter(CharityCampaign.id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Không tìm thấy chiến dịch")
        
    db.delete(db_campaign)
    db.commit()
    return {"message": "Xoá chiến dịch thành công"}

@router.get("/transactions")
def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    transaction_type: Optional[str] = Query(None, regex="^(donation|expense)$"),
    campaign_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các giao dịch quỹ."""
    query = db.query(CharityTransaction).order_by(CharityTransaction.created_at.desc())
    if transaction_type:
        query = query.filter(CharityTransaction.transaction_type == transaction_type)
    if campaign_id is not None:
        query = query.filter(CharityTransaction.campaign_id == campaign_id)
        
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/transactions", response_model=CharityTransactionResponse, status_code=201)
def create_transaction(
    data: CharityTransactionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    """Thêm giao dịch thủ công (đóng góp hoặc chi phí) (Chỉ Admin)."""
    amount = data.amount
    if data.transaction_type == "expense":
        amount = -abs(amount)
    elif data.transaction_type == "donation":
        amount = abs(amount)
        
    db_tx = CharityTransaction(
        campaign_id=data.campaign_id,
        donor_recipient=data.donor_recipient,
        amount=amount,
        transaction_type=data.transaction_type,
        description=data.description
    )
    db.add(db_tx)
    
    # If donation and campaign_id is provided, increase raised_amount
    if db_tx.campaign_id and db_tx.transaction_type == "donation":
        campaign = db.query(CharityCampaign).filter(CharityCampaign.id == db_tx.campaign_id).first()
        if campaign:
            campaign.raised_amount += db_tx.amount
            if campaign.raised_amount >= campaign.target_amount:
                campaign.status = "completed"
            elif campaign.raised_amount >= 0.8 * campaign.target_amount:
                campaign.status = "closing"
                
    db.commit()
    db.refresh(db_tx)
    return db_tx


@router.get("/campaigns/{campaign_id}/export")
def export_campaign_transactions_csv(
    campaign_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin)
):
    from fastapi.responses import StreamingResponse
    import io
    import csv
    from datetime import datetime

    # Get campaign details
    campaign = db.query(CharityCampaign).filter(CharityCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Không tìm thấy chiến dịch")

    # Get all transactions for the campaign, sorted by created_at desc
    transactions = db.query(CharityTransaction).filter(
        CharityTransaction.campaign_id == campaign_id
    ).order_by(CharityTransaction.created_at.desc()).all()

    current_date = datetime.now().strftime("%d/%m/%Y %H:%M")
    status_mapping = {
        "active": "Đang thực hiện",
        "closing": "Sắp hoàn thành",
        "completed": "Đã hoàn thành"
    }
    status_label = status_mapping.get(campaign.status, campaign.status)

    output = io.StringIO()
    output.write('\ufeff')  # Write UTF-8 BOM for Vietnamese character encoding in Excel
    writer = csv.writer(output)

    writer.writerow([f"BÁO CÁO CHI TIẾT CHIẾN DỊCH THIỆN NGUYỆN: {campaign.name.upper()}"])
    writer.writerow([f"Slogan: {campaign.slogan or 'N/A'}"])
    writer.writerow([f"Mục tiêu: {int(campaign.target_amount):,} VNĐ".replace(",", ".")])
    writer.writerow([f"Đã trích quỹ: {int(campaign.raised_amount):,} VNĐ".replace(",", ".")])
    writer.writerow([f"Trạng thái: {status_label}"])
    writer.writerow([f"Địa chỉ mái ấm: {campaign.address or 'N/A'}"])
    writer.writerow([f"Ngày xuất báo cáo: {current_date}"])
    writer.writerow([])

    writer.writerow([
        "Mã giao dịch",
        "Đối tượng / Mã",
        "Ngày thực hiện",
        "Loại giao dịch",
        "Mã đơn hàng",
        "Giá trị đơn hàng (VNĐ)",
        "Số tiền trích/chi quỹ (VNĐ)",
        "Mô tả"
    ])

    for tx in transactions:
        is_donation = tx.transaction_type == "donation"
        date_formatted = tx.created_at.strftime("%d/%m/%Y %H:%M:%S") if tx.created_at else "N/A"
        
        # Calculate estimated order value for donation (amount / 0.05)
        estimated_order_value = int(round(tx.amount / 0.05)) if is_donation else 0
        order_value_str = f"{estimated_order_value:,}".replace(",", ".") if is_donation else "N/A"
        
        type_label = "Đóng góp (Trích 5% đơn hàng)" if is_donation else "Chi phí / Giải ngân quỹ"
        
        # format amount with + or - prefix
        prefix = "+" if is_donation else "-"
        amount_abs = abs(tx.amount)
        amount_str = f"{prefix} {int(round(amount_abs)):,}".replace(",", ".")
        
        writer.writerow([
            tx.id,
            tx.donor_recipient,
            date_formatted,
            type_label,
            tx.order_code or "N/A",
            order_value_str,
            amount_str,
            tx.description or "N/A"
        ])

    output.seek(0)
    
    safe_filename = f"bao_cao_doi_soat_chien_dich_{campaign_id}.csv"
    headers = {
        'Content-Disposition': f'attachment; filename="{safe_filename}"'
    }
    return StreamingResponse(io.BytesIO(output.getvalue().encode('utf-8')), media_type="text/csv", headers=headers)

