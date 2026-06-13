from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_shop_staff_or_admin
from app.models.user import User, UserRole
from app.models.chat_message import ChatMessage
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ConversationResponse, RecentOrderBrief

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/messages", response_model=List[ChatMessageResponse])
def get_customer_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tin nhắn của khách hàng hiện tại."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.customer_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return messages


@router.post("/messages", response_model=ChatMessageResponse, status_code=201)
def send_message(
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gửi tin nhắn mới (cho cả khách hàng và nhân viên)."""
    # Xác định customer_id và sender_id
    if current_user.role in [UserRole.ADMIN, UserRole.STAFF, UserRole.SHOP_STAFF, UserRole.CUSTOMER_SERVICE]:
        # Nhân viên gửi tin nhắn
        if not data.customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nhân viên gửi tin nhắn bắt đầu hội thoại cần truyền customer_id."
            )
        customer_id = data.customer_id
        sender_id = current_user.id
        
        # Đánh dấu các tin nhắn của khách hàng trước đó là đã đọc
        db.query(ChatMessage).filter(
            ChatMessage.customer_id == customer_id,
            ChatMessage.sender_id == customer_id,
            ChatMessage.is_read == 0
        ).update({"is_read": 1})
    else:
        # Khách hàng gửi tin nhắn
        customer_id = current_user.id
        sender_id = current_user.id

    chat_message = ChatMessage(
        customer_id=customer_id,
        sender_id=sender_id,
        text=data.text,
        product_info=data.product_info,
        image_url=data.image_url,
        is_read=0
    )
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)

    # Auto reply logic for customers selecting suggestions
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF, UserRole.SHOP_STAFF, UserRole.CUSTOMER_SERVICE]:
        text_clean = data.text.strip().lower()
        auto_reply = None
        auto_reply_image = None
        if "bảng size" in text_clean or "chọn size" in text_clean:
            auto_reply = (
                "Dạ Từ Tâm Phục gửi bạn bảng size chuẩn pháp phục ạ:\n"
                "- Size S: 150 - 158 cm (42 - 49 kg)\n"
                "- Size M: 156 - 165 cm (50 - 58 kg)\n"
                "- Size L: 163 - 172 cm (59 - 68 kg)\n"
                "- Size XL: 170 - 180 cm (69 - 80 kg)\n"
                "Bạn có thể đối chiếu số đo để lựa chọn kích thước phù hợp nhất nhé!"
            )
            auto_reply_image = None
        elif "địa chỉ" in text_clean or "cửa hàng ở đâu" in text_clean:
            auto_reply = (
                "Dạ, cửa hàng Từ Tâm Phục hiện có địa chỉ tại: 70 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh.\n"
                "Cửa hàng mở cửa từ 8:00 đến 21:30 hàng ngày ạ. Rất mong được đón tiếp bạn!"
            )
        elif "đổi trả" in text_clean or "chính sách" in text_clean:
            auto_reply = (
                "Từ Tâm Phục hỗ trợ đổi hàng trong vòng 7 ngày kể từ khi nhận sản phẩm đối với các trường hợp:\n"
                "- Sản phẩm còn nguyên tag mác, chưa qua sử dụng, giặt ủi.\n"
                "- Đổi size hoặc đổi mẫu khác bằng hoặc cao giá hơn.\n"
                "Nếu có bất kỳ vấn đề gì về sản phẩm, bạn cứ gửi tin nhắn cho mình nhé!"
            )
        elif "nhân viên hỗ trợ" in text_clean or "gặp nhân viên" in text_clean:
            auto_reply = (
                "Dạ, yêu cầu của bạn đã được chuyển tới nhân viên chăm sóc khách hàng. "
                "Bạn vui lòng đợi trong giây lát, nhân viên sẽ phản hồi bạn ngay lập tức ạ!"
            )

        if auto_reply:
            # Find a staff or admin user to act as sender
            staff_user = (
                db.query(User)
                .filter(User.role.in_([UserRole.CUSTOMER_SERVICE, UserRole.ADMIN, UserRole.STAFF, UserRole.SHOP_STAFF]))
                .first()
            )
            staff_id = staff_user.id if staff_user else 1
            
            auto_msg = ChatMessage(
                customer_id=customer_id,
                sender_id=staff_id,
                text=auto_reply,
                image_url=auto_reply_image,
                is_read=0
            )
            db.add(auto_msg)
            db.commit()

    return chat_message


@router.get("/conversations", response_model=List[ConversationResponse])
def get_staff_conversations(
    current_user: User = Depends(require_shop_staff_or_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách hội thoại của tất cả khách hàng (cho nhân viên)."""
    # Lấy danh sách các customer_id duy nhất
    customer_ids = [r[0] for r in db.query(ChatMessage.customer_id).distinct().all()]
    
    conversations = []
    for c_id in customer_ids:
        # Lấy thông tin user
        user = db.query(User).filter(User.id == c_id).first()
        if not user:
            continue
            
        # Lấy thông tin customer chi tiết (tier, phone, address)
        cust = user.customer
        if not cust:
            # Tạo dữ liệu fallback nếu chưa liên kết customer
            cust_name = user.full_name
            cust_email = user.email
            cust_phone = user.phone or "Chưa cập nhật"
            cust_address = "Chưa cập nhật"
            cust_tier = "Thành viên mới"
            cust_avatar = user.avatar
        else:
            cust_name = cust.full_name
            cust_email = cust.email
            cust_phone = cust.phone or "Chưa cập nhật"
            cust_address = cust.address or "Chưa cập nhật"
            cust_tier = cust.tier
            cust_avatar = cust.avatar

        # Lấy tin nhắn cuối cùng
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.customer_id == c_id)
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        if not last_msg:
            continue
            
        last_message_text = last_msg.text
        # Format time tin nhắn cuối
        last_message_time = last_msg.created_at.strftime("%H:%M")
        
        # Check xem có tin nhắn chưa đọc từ khách hàng không
        unread = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.customer_id == c_id,
                ChatMessage.sender_id == c_id,
                ChatMessage.is_read == 0
            )
            .count() > 0
        )

        # Lấy danh sách đơn hàng gần đây
        recent_orders = (
            db.query(Order)
            .filter(Order.user_id == c_id)
            .order_by(Order.created_at.desc())
            .limit(2)
            .all()
        )
        
        mapped_orders = []
        for o in recent_orders:
            # Lấy tên sản phẩm đầu tiên làm tóm tắt
            item_name = "Đơn hàng mới"
            if o.items:
                snapshot = o.items[0].product_snapshot
                if snapshot and isinstance(snapshot, dict):
                    item_name = snapshot.get("name", "Sản phẩm")
                    if o.items[0].variant:
                        item_name += f" - {o.items[0].variant.value}"
                elif o.items[0].product:
                    item_name = o.items[0].product.name
            
            # Format price
            price_formatted = f"{int(o.total):,}đ".replace(",", ".")
            
            # Trạng thái Việt hóa
            status_map = {
                "pending": "Chờ xử lý",
                "confirmed": "Đã xác nhận",
                "processing": "Đang xử lý",
                "shipped": "Đang giao hàng",
                "delivered": "Hoàn thành",
                "cancelled": "Đã hủy",
                "refunded": "Đã hoàn tiền"
            }
            order_status = status_map.get(o.status.value if hasattr(o.status, "value") else o.status, "Đang xử lý")

            mapped_orders.append(RecentOrderBrief(
                id=o.order_code,
                status=order_status,
                item=item_name,
                price=price_formatted
            ))

        # Lấy tất cả tin nhắn trong hội thoại
        all_msgs = (
            db.query(ChatMessage)
            .filter(ChatMessage.customer_id == c_id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )

        conversations.append(ConversationResponse(
            id=c_id,
            name=cust_name,
            initials=cust_name[0] if cust_name else "C",
            lastMessage=last_message_text,
            time=last_message_time,
            unread=unread,
            avatar=cust_avatar,
            statusText="Trực tuyến" if unread else "Đã hoạt động",
            tier=cust_tier,
            email=cust_email,
            phone=cust_phone,
            address=cust_address,
            recentOrders=mapped_orders,
            messages=all_msgs
        ))
        
    return conversations


@router.get("/conversations/{customer_id}/messages", response_model=List[ChatMessageResponse])
def get_conversation_messages(
    customer_id: int,
    current_user: User = Depends(require_shop_staff_or_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tin nhắn của một hội thoại cụ thể và đánh dấu đã đọc (cho nhân viên)."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.customer_id == customer_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    
    # Đánh dấu các tin nhắn của khách hàng trước đó là đã đọc
    db.query(ChatMessage).filter(
        ChatMessage.customer_id == customer_id,
        ChatMessage.sender_id == customer_id,
        ChatMessage.is_read == 0
    ).update({"is_read": 1})
    db.commit()
    
    return messages
