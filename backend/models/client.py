from sqlalchemy import Column, Integer, DateTime, String, Date
from datetime import datetime
from db.base import Base
from sqlalchemy.orm import relationship

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    state = Column(String(255), nullable=False)
    birth_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    tickets = relationship('Ticket', back_populates='client')
    # Las relaciones con Package ahora se manejan a través de backref en el modelo Package
    # sent_packages y received_packages


    # Passw0rd!