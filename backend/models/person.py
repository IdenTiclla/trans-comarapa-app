from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship, declared_attr
from datetime import datetime
from db.base import Base

class Person(Base):
    """
    Clase base para personas en el sistema (Secretary, Driver, Assistant).
    Esta es una clase abstracta que no se mapea directamente a una tabla.
    """
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    phone = Column(String(255), nullable=True)
    birth_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Eliminadas las relaciones con User para que cada subclase las defina individualmente
