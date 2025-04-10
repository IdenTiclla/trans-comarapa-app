from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Client(Person):
    __tablename__ = "clients"

    # Campos específicos de Client
    address = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    state = Column(String(255), nullable=False)

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="client")

    # Relaciones específicas de Client
    tickets = relationship('Ticket', back_populates='client')
    # Las relaciones con Package ahora se manejan a través de backref en el modelo Package
    # sent_packages y received_packages


    # Passw0rd!