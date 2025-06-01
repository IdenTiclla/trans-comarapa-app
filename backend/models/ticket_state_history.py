from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base # Assuming your Base is in db.base
from models.user import User # Assuming User model for changed_by_user_id

class TicketStateHistory(Base):
    __tablename__ = "ticket_state_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    old_state = Column(String(50), nullable=True)
    new_state = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=datetime.now, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Or make it not nullable if a user must always be associated

    ticket = relationship("Ticket", back_populates="state_history")
    changed_by_user = relationship("User") # Add back_populates in User model if needed

    def __repr__(self):
        return f"<TicketStateHistory(ticket_id={self.ticket_id}, old_state='{self.old_state}', new_state='{self.new_state}', changed_at='{self.changed_at}')>"

# In your models/ticket.py, you would add:
# state_history = relationship("TicketStateHistory", back_populates="ticket", order_by="TicketStateHistory.changed_at") 