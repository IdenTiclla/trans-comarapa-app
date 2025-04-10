from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Administrator(Person):
    __tablename__ = 'administrators'

    # No hay campos específicos según el UML, solo created_at y updated_at
    # que ya están en la clase base Person
    
    # Relación con User (uno a uno)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True)
    user = relationship("User", back_populates="administrator") 