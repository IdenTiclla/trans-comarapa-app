from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.base import Base

class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True)
    state = Column(String(255), nullable=False)
    seat_id = Column(Integer, ForeignKey('seats.id'), nullable=False)
    seat = relationship('Seat', back_populates='tickets')
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    client = relationship('Client', back_populates='tickets')
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=False)
    trip = relationship('Trip', back_populates='tickets')
    destination = Column(String(255), nullable=True)
    secretary_id = Column(Integer, ForeignKey('secretaries.id'), nullable=False)
    secretary = relationship('Secretary', back_populates='tickets')
    price = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship to TicketStateHistory
    state_history = relationship("TicketStateHistory", back_populates="ticket", order_by="desc(TicketStateHistory.changed_at)")    
