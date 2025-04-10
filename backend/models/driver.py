from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Driver(Person):
    __tablename__ = "drivers"

    # Campos específicos de Driver según el UML
    license_number = Column(String(50), unique=True)
    license_type = Column(String(50))
    license_expiry = Column(Date)
    status = Column(String(20), default="active")

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="driver")
    
    # Relaciones específicas de Driver
    trips = relationship("Trip", back_populates="driver")
