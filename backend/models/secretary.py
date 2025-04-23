from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Secretary(Base):
    __tablename__ = 'secretaries'

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    phone = Column(String(255), nullable=True)
    birth_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

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
