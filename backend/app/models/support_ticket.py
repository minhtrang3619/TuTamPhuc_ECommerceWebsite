from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SupportTicket(BaseModel):
    __tablename__ = "support_tickets"

    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(20), default="medium", nullable=False)  # "low", "medium", "high"
    status = Column(String(20), default="pending", nullable=False)    # "pending", "solving", "closed"

    # Relationship to user
    user = relationship("User", backref="support_tickets")

    def __repr__(self):
        return f"<SupportTicket id={self.id} code={self.ticket_code} status={self.status}>"
