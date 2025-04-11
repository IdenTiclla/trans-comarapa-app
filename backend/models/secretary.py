from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Secretary(Person):
    __tablename__ = 'secretaries'

    # Campos específicos de Secretary según el UML
    office_id = Column(Integer, ForeignKey('offices.id'), nullable=True)

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="secretary")

    # Relaciones específicas de Secretary
    tickets = relationship("Ticket", back_populates="secretary")
    trips = relationship("Trip", back_populates="secretary")
    packages = relationship("Package", back_populates="secretary")
    office = relationship("Office", back_populates="secretaries")

    # Campos específicos de Secretary (si los hubiera)
    # office_location = Column(String(255), nullable=True)
