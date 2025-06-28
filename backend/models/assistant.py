from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Assistant(Person):
    __tablename__ = 'assistants'
    
    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # No hay campos específicos de Assistant, solo los heredados de Person
    
    __mapper_args__ = {
        'polymorphic_identity': 'assistant'
    }

    # Relaciones específicas de Assistant
    trips = relationship("Trip", back_populates="assistant")
