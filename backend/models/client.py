from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person
from datetime import date

class Client(Person):
    __tablename__ = "clients"
    
    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # Campos específicos del cliente
    document_id = Column(String(255), nullable=True, index=True)  # CI field
    address = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'client'
    }

    # Relaciones específicas de Client
    tickets = relationship('Ticket', back_populates='client')
    # Las relaciones con Package ahora se manejan a través de backref en el modelo Package
    # sent_packages y received_packages
    
    # 🆕 PROPIEDADES CALCULADAS
    @property
    def email(self):
        """Obtener email desde User relacionado - eliminando duplicación"""
        return self.user.email if self.user else None
    
    @property
    def age(self):
        """Calcular edad actual desde birth_date"""
        if not self.birth_date:
            return None
        
        today = date.today()
        return today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )
    
    @property
    def is_minor(self):
        """Verificar si es menor de edad (< 18 años) - calculado automáticamente"""
        age = self.age
        return age is not None and age < 18
    
    @property
    def age_category(self):
        """Categoría de edad para lógica de negocio"""
        age = self.age
        if age is None:
            return "unknown"
        elif age < 18:
            return "minor"
        elif age < 65:
            return "adult"
        else:
            return "senior"
    
    def __repr__(self):
        return f"<Client(id={self.id}, document_id='{self.document_id}', name='{self.full_name}', age={self.age})>"