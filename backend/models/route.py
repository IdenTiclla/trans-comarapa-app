from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    origin_location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)
    destination_location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)
    distance = Column(Float, nullable=False)  # en kilómetros
    duration = Column(Float, nullable=False)  # en horas
    price = Column(Float, nullable=False)     # en bolivianos

    # Relationships
    trips = relationship("Trip", back_populates="route")
    origin_location = relationship("Location", foreign_keys=[origin_location_id], back_populates="origin_routes")
    destination_location = relationship("Location", foreign_keys=[destination_location_id], back_populates="destination_routes")