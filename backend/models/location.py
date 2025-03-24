from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from db.base import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)  # Changed to Float for proper numeric handling
    longitude = Column(Float, nullable=False)  # Changed to Float for proper numeric handling
    address = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="Bolivia")
    postal_code = Column(String(10), nullable=True)
    description = Column(String(500), nullable=True)

    # Relationships
    origin_routes = relationship("Route", back_populates="origin_location", foreign_keys="Route.origin_location_id")
    destination_routes = relationship("Route", back_populates="destination_location", foreign_keys="Route.destination_location_id")
