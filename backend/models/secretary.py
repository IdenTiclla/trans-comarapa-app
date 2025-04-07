from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Secretary(Base):
    __tablename__ = 'secretaries'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(255), nullable=False)
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    tickets = relationship("Ticket", back_populates="secretary")
    trips = relationship("Trip", back_populates="secretary")
    packages = relationship("Package", back_populates="secretary")
    
