from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Secretary(Person):
    __tablename__ = 'secretaries'
    
    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # Campos específicos de Secretary
    office_id = Column(Integer, ForeignKey('offices.id'), nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'secretary'
    }

    # Relaciones específicas de Secretary
    tickets = relationship("Ticket", back_populates="secretary")
    trips = relationship("Trip", back_populates="secretary")
    packages = relationship("Package", back_populates="secretary")
    office = relationship("Office", back_populates="secretaries")
