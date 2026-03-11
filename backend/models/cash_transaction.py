from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime

from db.base import Base
from core.enums import CashTransactionType, PaymentMethod

class CashTransaction(Base):
    __tablename__ = 'cash_transactions'

    id = Column(Integer, primary_key=True)
    cash_register_id = Column(Integer, ForeignKey('cash_registers.id'), nullable=False)
    type = Column(SQLEnum(CashTransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    
    # Polymorphic-like references to the entity that generated the transaction
    reference_id = Column(Integer, nullable=True)
    reference_type = Column(String(50), nullable=True) # e.g. "ticket", "package"
    
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    cash_register = relationship("CashRegister", back_populates="transactions")
