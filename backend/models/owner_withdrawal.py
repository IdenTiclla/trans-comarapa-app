from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.base import Base

class OwnerWithdrawal(Base):
    __tablename__ = "owner_withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    
    owner_id = Column(Integer, ForeignKey('persons.id'), nullable=False)
    owner = relationship("Owner", back_populates="withdrawals", foreign_keys=[owner_id])
    
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=True)  # Puede ser retiro de un viaje específico
    trip = relationship("Trip", backref="owner_withdrawals")
    
    # Enlace a la transacción de caja de la oficina donde se hizo el retiro
    cash_transaction_id = Column(Integer, ForeignKey('cash_transactions.id'), nullable=False)
    cash_transaction = relationship("CashTransaction", backref="owner_withdrawals")
    
    # Quién entregó el dinero
    secretary_id = Column(Integer, ForeignKey('secretaries.id'), nullable=False)
    secretary = relationship("Secretary", foreign_keys=[secretary_id])
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f"<OwnerWithdrawal(id={self.id}, owner_id={self.owner_id}, trip_id={self.trip_id})>"
