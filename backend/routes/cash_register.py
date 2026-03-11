from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User

from schemas.cash_register import (
    CashRegisterCreate,
    CashRegisterUpdate,
    CashRegisterResponse,
    CashTransactionCreate,
    CashTransactionResponse,
    DailySummaryResponse,
    CashRegisterWithTransactionsResponse
)
from services.cash_register_service import CashRegisterService

router = APIRouter(prefix="/cash-registers", tags=["Cash Registers"])

def get_service(db: Session = Depends(get_db)) -> CashRegisterService:
    return CashRegisterService(db)

@router.post("/open", response_model=CashRegisterResponse, status_code=201)
def open_register(
    data: CashRegisterCreate,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Open a new cash register for an office. Typically requires the current_user's ID."""
    return service.open_register(data.office_id, data.opened_by_id, data.initial_balance)

@router.get("/current/{office_id}", response_model=Optional[CashRegisterResponse])
def get_current_register(
    office_id: int,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the currently open cash register for a given office.
    Returns null (HTTP 200) when there is no open register — this is a normal state, not an error.
    """
    return service.get_current_register(office_id)

@router.put("/{register_id}/close", response_model=CashRegisterResponse)
def close_register(
    register_id: int,
    data: CashRegisterUpdate,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Close an open cash register."""
    return service.close_register(register_id, data.closed_by_id, data.final_balance)

@router.post("/{register_id}/transactions", response_model=CashTransactionResponse, status_code=201)
def record_transaction(
    register_id: int,
    data: CashTransactionCreate,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Manually record a transaction (withdrawal, adjustment, etc) for a register."""
    if data.cash_register_id != register_id:
        raise HTTPException(status_code=400, detail="Path ID and Body ID mismatch")
    return service.record_transaction(data)

@router.get("/{register_id}/transactions", response_model=List[CashTransactionResponse])
def get_register_transactions(
    register_id: int,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for a given register."""
    return service.get_register_transactions(register_id)

@router.get("/{register_id}/summary", response_model=DailySummaryResponse)
def get_daily_summary(
    register_id: int,
    service: CashRegisterService = Depends(get_service),
    current_user: User = Depends(get_current_user)
):
    """Calculates the expected balance and lists aggregates for the day."""
    return service.get_daily_summary(register_id)
