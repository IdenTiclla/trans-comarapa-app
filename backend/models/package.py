from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from db.base import Base

class Package(Base):
    __tablename__ = "packages"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(100), nullable=True)
    weight = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(100), nullable=False)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    sender_id = Column(Integer, ForeignKey('clients.id'))
    sender = relationship("Client", foreign_keys=[sender_id], backref="sent_packages")
    
    recipient_id = Column(Integer, ForeignKey('clients.id'))
    recipient = relationship("Client", foreign_keys=[recipient_id], backref="received_packages")
    
    trip_id = Column(Integer, ForeignKey('trips.id'))
    trip = relationship("Trip", back_populates="packages")  # A trip can contain many packages


