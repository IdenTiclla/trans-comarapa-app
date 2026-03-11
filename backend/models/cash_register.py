from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime

from db.base import Base
from core.enums import CashRegisterStatus

class CashRegister(Base):
    __tablename__ = 'cash_registers'

    id = Column(Integer, primary_key=True)
    office_id = Column(Integer, ForeignKey('offices.id'), nullable=False)
    date = Column(Date, nullable=False)
    opened_by_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    closed_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    initial_balance = Column(Float, nullable=False, default=0.0)
    final_balance = Column(Float, nullable=True)
    status = Column(SQLEnum(CashRegisterStatus), nullable=False, default=CashRegisterStatus.OPEN)
    
    opened_at = Column(DateTime, default=datetime.now)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    office = relationship("Office", backref="cash_registers")
    opened_by = relationship("User", foreign_keys=[opened_by_id])
    closed_by = relationship("User", foreign_keys=[closed_by_id])
    transactions = relationship("CashTransaction", back_populates="cash_register", cascade="all, delete-orphan")
