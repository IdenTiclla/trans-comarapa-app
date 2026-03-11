from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from schemas.office import OfficeCreate, OfficeResponse, OfficeUpdate
from auth.jwt import get_current_admin_user, get_current_active_user
from services.office_service import OfficeService

router = APIRouter(tags=["Offices"])


def get_service(db: Session = Depends(get_db)) -> OfficeService:
    return OfficeService(db)


@router.post("", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
def create_office(
    office: OfficeCreate,
    service: OfficeService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.create_office(office)


@router.get("", response_model=List[OfficeResponse])
def get_offices(
    skip: int = 0,
    limit: int = 100,
    service: OfficeService = Depends(get_service),
    current_user: User = Depends(get_current_active_user),
):
    return service.get_offices(skip=skip, limit=limit)


@router.get("/{office_id}", response_model=OfficeResponse)
def get_office(
    office_id: int, 
    service: OfficeService = Depends(get_service),
    current_user: User = Depends(get_current_active_user),
):
    return service.get_office(office_id)


@router.put("/{office_id}", response_model=OfficeResponse)
def update_office(
    office_id: int,
    office_update: OfficeUpdate,
    service: OfficeService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.update_office(office_id, office_update)


@router.delete("/{office_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_office(
    office_id: int,
    service: OfficeService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    service.delete_office(office_id)
