from sqlalchemy import Column, Integer, ForeignKey
from models.person import Person

class Administrator(Person):
    __tablename__ = 'administrators'
    
    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # No hay campos específicos de Administrator, solo los heredados de Person
    
    __mapper_args__ = {
        'polymorphic_identity': 'administrator'
    }