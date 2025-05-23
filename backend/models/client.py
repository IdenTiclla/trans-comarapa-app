from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    document_id = Column(String(255), nullable=True, index=True)  # CI field
    phone = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    birth_date = Column(Date, nullable=True)
    is_minor = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Campos específicos de Client
    address = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="client")

    # Relaciones específicas de Client
    tickets = relationship('Ticket', back_populates='client')
    # Las relaciones con Package ahora se manejan a través de backref en el modelo Package
    # sent_packages y received_packages


    # Passw0rd!