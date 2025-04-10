from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Office(Base):
    __tablename__ = 'offices'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=True)
    phone = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    manager_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relaciones
    location = relationship("Location", back_populates="offices")
    secretaries = relationship("Secretary", back_populates="office") 