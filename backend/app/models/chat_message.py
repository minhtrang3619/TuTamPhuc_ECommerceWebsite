from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    product_info = Column(JSON, nullable=True)  # For attaching product cards: {id, name, price, image}
    image_url = Column(String(500), nullable=True)  # For attaching image files
    is_read = Column(Column(Integer, default=0, nullable=False).type, default=0, nullable=False) # For tracking read status by staff: 0 = unread, 1 = read

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], backref="chat_threads")
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
