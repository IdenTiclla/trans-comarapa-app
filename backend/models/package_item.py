from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from db.base import Base

class PackageItem(Base):
    __tablename__ = "package_items"
    
    id = Column(Integer, primary_key=True)
    quantity = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=False)  # Detalle del item
    unit_price = Column(Float, nullable=False)  # Precio unitario
    total_price = Column(Float, nullable=False)  # Cantidad × Precio unitario
    
    # Relación con Package
    package_id = Column(Integer, ForeignKey('packages.id'), nullable=False)
    package = relationship("Package", back_populates="items")
    
    def __repr__(self):
        return f"<PackageItem(id={self.id}, quantity={self.quantity}, description='{self.description}', total_price={self.total_price})>" 