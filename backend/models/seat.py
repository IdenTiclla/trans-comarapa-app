from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True)
    bus_id = Column(Integer, ForeignKey('buses.id'), nullable=False)
    bus = relationship('Bus', back_populates='seats')
    seat_number = Column(Integer, nullable=False)
    deck = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    tickets = relationship('Ticket', back_populates='seat')

