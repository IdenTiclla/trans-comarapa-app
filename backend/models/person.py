from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, date
from db.base import Base

class Person(Base):
    __tablename__ = "persons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False, index=True)
    type = Column(String(50), nullable=False)  # Discriminador
    
    # Información personal
    firstname = Column(String(100), nullable=True)
    lastname = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Configuración de herencia
    __mapper_args__ = {
        'polymorphic_identity': 'person',
        'polymorphic_on': type,
        'with_polymorphic': '*'
    }
    
    # Relación con User
    user = relationship("User", back_populates="person")
    
    @property
    def full_name(self):
        """Nombre completo de la persona"""
        first = self.firstname or ''
        last = self.lastname or ''
        full = f"{first} {last}".strip()
        return full or self.user.username if self.user else "Usuario"
    
    @property
    def email(self):
        """Obtener email desde User relacionado"""
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
        """Verificar si es menor de edad (< 18 años)"""
        age = self.age
        return age is not None and age < 18
    
    @property
    def initials(self):
        """Obtener iniciales del nombre"""
        first = self.firstname[0].upper() if self.firstname else ''
        last = self.lastname[0].upper() if self.lastname else ''
        return f"{first}{last}" or (self.user.username[0].upper() if self.user else "U")
    
    def __repr__(self):
        return f"<Person(id={self.id}, type='{self.type}', name='{self.full_name}')>"