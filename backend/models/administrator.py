from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Administrator(Person):
    __tablename__ = 'administrators'

    # No hay campos específicos de Administrator según el UML, solo los heredados de Person

    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="administrator")