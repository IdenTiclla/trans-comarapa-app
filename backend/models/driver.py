from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Driver(Person):
    __tablename__ = "drivers"
    
    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # Campos específicos del conductor
    license_number = Column(String(50), unique=True, nullable=True)
    license_type = Column(String(50), nullable=True)
    license_expiry = Column(Date, nullable=True)
    status = Column(String(20), default="active")
    
    __mapper_args__ = {
        'polymorphic_identity': 'driver'
    }

    # Relaciones específicas de Driver
    trips = relationship("Trip", back_populates="driver")
    
    # MANTENER temporalmente para compatibilidad - será removido en FASE 6
    # Relación legacy con User 
    @property
    def user_id_legacy(self):
        return self.user_id if hasattr(self, 'user_id') else None
