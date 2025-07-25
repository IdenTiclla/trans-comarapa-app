from sqlalchemy import Column, Integer, String
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

    trips = relationship("Trip", back_populates="bus")
    seats = relationship("Seat", back_populates="bus")
