from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from ..db.base import Base

class Trip(Base):
    __tablename__ = 'trips'

    id = Column(Integer, primary_key=True)
    trip_date = Column(Date, nullable=False)
    
    driver_id = Column(Integer, ForeignKey('drivers.id'))
    driver = relationship("Driver", back_populates="trips")
    
    assistant_id = Column(Integer, ForeignKey('assistants.id'), nullable=True)
    assistant = relationship("Assistant", back_populates="trips", uselist=False)
