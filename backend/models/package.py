from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from db.base import Base

class Package(Base):
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True)
    tracking_number = Column(String(20), unique=True, nullable=False)  # Número de encomienda (ej: 003589)
    
    # Información general del paquete
    total_weight = Column(Float, nullable=True)  # Peso total del paquete
    total_declared_value = Column(Float, nullable=True)  # Valor declarado total
    notes = Column(Text, nullable=True)  # Observaciones adicionales
    
    # Estado del paquete
    # Estados: registered_at_office, assigned_to_trip, in_transit, arrived_at_destination, delivered
    status = Column(String(50), nullable=False, default="registered_at_office")
    
    # Fechas y horarios
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    sender_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    sender = relationship("Client", foreign_keys=[sender_id], backref="sent_packages")
    
    recipient_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    recipient = relationship("Client", foreign_keys=[recipient_id], backref="received_packages")
    
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=True)  # Nullable: encomienda puede no estar asignada a un viaje
    trip = relationship("Trip", back_populates="packages")
    
    secretary_id = Column(Integer, ForeignKey('secretaries.id'), nullable=False)
    secretary = relationship("Secretary", back_populates="packages")
    
    # Nueva relación con items
    items = relationship("PackageItem", back_populates="package", cascade="all, delete-orphan")
    
    # Relationship to PackageStateHistory
    state_history = relationship("PackageStateHistory", back_populates="package", order_by="desc(PackageStateHistory.changed_at)")
    
    @property
    def total_amount(self):
        """Calcula el monto total sumando todos los items"""
        return sum(item.total_price for item in self.items) if self.items else 0.0
    
    @property
    def total_items_count(self):
        """Cuenta el total de items en el paquete"""
        return sum(item.quantity for item in self.items) if self.items else 0
    
    def __repr__(self):
        return f"<Package(id={self.id}, tracking_number='{self.tracking_number}', status='{self.status}', total_amount={self.total_amount})>"
