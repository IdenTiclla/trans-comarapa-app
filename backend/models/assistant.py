from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Assistant(Person):
    __tablename__ = 'assistants'

    # No hay campos específicos de Assistant según el UML, solo los heredados de Person

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="assistant")

    # Relaciones específicas de Assistant
    trips = relationship("Trip", back_populates="assistant")
