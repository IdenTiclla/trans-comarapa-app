from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from auth.jwt import get_current_user
from models.user import User
from schemas.owner import OwnerCreate, OwnerUpdate, Owner as OwnerSchema
from schemas.bus import Bus as BusSchema
from services.owner_service import OwnerService
from services.owner_financial_service import OwnerFinancialService
from db.session import get_db

router = APIRouter(
    prefix="/owners",
    tags=["Owners"]
)

class WithdrawalRequest(BaseModel):
    trip_id: int
    amount: float
    office_id: int

@router.get("", response_model=List[OwnerSchema])
def get_owners(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    return service.get_owners(skip=skip, limit=limit)

@router.get("/{owner_id}", response_model=OwnerSchema)
def get_owner(
    owner_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    return service.get_owner(owner_id)

@router.post("", response_model=OwnerSchema, status_code=status.HTTP_201_CREATED)
def create_owner(
    owner_in: OwnerCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    return service.create_owner(owner_in)

@router.patch("/{owner_id}", response_model=OwnerSchema)
def update_owner(
    owner_id: int, 
    owner_in: OwnerUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    return service.update_owner(owner_id, owner_in)

@router.delete("/{owner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_owner(
    owner_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    service.delete_owner(owner_id)

@router.get("/{owner_id}/financials")
def get_owner_financials(
    owner_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    service = OwnerFinancialService(db)
    return service.get_owner_trips_financials(owner_id)

@router.get("/{owner_id}/buses", response_model=List[BusSchema])
def get_owner_buses(
    owner_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerService(db)
    owner = service.get_owner(owner_id)
    return owner.buses

@router.post("/{owner_id}/withdraw")
def process_withdrawal(
    owner_id: int, 
    withdrawal: WithdrawalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OwnerFinancialService(db)
    result = service.process_owner_withdrawal(
        owner_id=owner_id,
        trip_id=withdrawal.trip_id,
        amount=withdrawal.amount,
        office_id=withdrawal.office_id,
        secretary_user_id=current_user.id
    )
    return {"status": "success", "withdrawal_id": result.id, "amount": withdrawal.amount}
