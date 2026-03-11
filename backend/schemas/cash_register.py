from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional, List
from core.enums import CashRegisterStatus, CashTransactionType, PaymentMethod

# Cash Transaction Schemas
class CashTransactionBase(BaseModel):
    type: CashTransactionType
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    description: Optional[str] = None

class CashTransactionCreate(CashTransactionBase):
    cash_register_id: int

class CashTransactionResponse(CashTransactionBase):
    id: int
    cash_register_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Cash Register Schemas
class CashRegisterBase(BaseModel):
    office_id: int
    initial_balance: float = Field(default=0.0, ge=0)

class CashRegisterCreate(CashRegisterBase):
    date: date
    opened_by_id: int

class CashRegisterUpdate(BaseModel):
    final_balance: float = Field(..., ge=0)
    closed_by_id: int
    status: CashRegisterStatus = CashRegisterStatus.CLOSED
    closed_at: datetime

class CashRegisterResponse(CashRegisterBase):
    id: int
    date: date
    opened_by_id: int
    closed_by_id: Optional[int] = None
    final_balance: Optional[float] = None
    status: CashRegisterStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CashRegisterWithTransactionsResponse(CashRegisterResponse):
    transactions: List[CashTransactionResponse] = []

class DailySummaryResponse(BaseModel):
    office_id: int
    date: date
    initial_balance: float
    final_balance: Optional[float]
    total_in: float
    total_out: float
    expected_balance: float
    is_closed: bool
    transactions_by_type: dict[str, float]
    transactions_by_method: dict[str, float]
