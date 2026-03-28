from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String(10), unique=True)
    capacity = Column(Integer)
    model = Column(String(100))
    brand = Column(String(50))
    color = Column(String(30))
    floors = Column(Integer, default=1)  # 1 o 2 pisos
    
    owner_id = Column(Integer, ForeignKey('persons.id'), nullable=True)
    owner = relationship("Owner", back_populates="buses")

    trips = relationship("Trip", back_populates="bus")
    seats = relationship("Seat", back_populates="bus", cascade="all, delete-orphan")
