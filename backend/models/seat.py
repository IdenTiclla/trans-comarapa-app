from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.base import Base

class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True)
    bus_id = Column(Integer, ForeignKey('buses.id'), nullable=False)
    bus = relationship('Bus', back_populates='seats')
    seat_number = Column(Integer, nullable=False)
    deck = Column(String(255), nullable=False)
    row = Column(Integer, nullable=False)      # fila (1, 2, 3...)
    column = Column(Integer, nullable=False)   # columna (1, 2, 3, 4)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tickets = relationship('Ticket', back_populates='seat')

