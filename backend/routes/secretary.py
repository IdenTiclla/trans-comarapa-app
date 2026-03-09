"""
Secretary routes — thin adapter layer. Creation logic lives in PersonService.
"""

from typing import List, Dict

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.secretary import Secretary as SecretaryModel
from models.trip import Trip as TripModel
from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from models.user import User as UserModel
from schemas.secretary import Secretary as SecretarySchema
from schemas.trip import Trip as TripSchema
from schemas.ticket import Ticket as TicketSchema
from schemas.secretary_with_user import SecretaryWithUser, SecretaryWithUserResponse
from schemas.auth import User as UserSchema
from auth.jwt import get_current_admin_user, get_current_user
from services.person_service import PersonService
from core.exceptions import ValidationException

router = APIRouter(tags=["Secretaries"])


def get_service(db: Session = Depends(get_db)) -> PersonService:
    return PersonService(db)


@router.post("", response_model=SecretaryWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_secretary_with_user(
    secretary_data: SecretaryWithUser,
    service: PersonService = Depends(get_service),
    _: UserModel = Depends(get_current_admin_user),
):
    person_data = {
        "firstname": secretary_data.firstname,
        "lastname": secretary_data.lastname,
        "phone": secretary_data.phone,
        "birth_date": secretary_data.birth_date,
        "office_id": secretary_data.office_id,
    }
    user_data = {
        "username": secretary_data.user.username,
        "email": secretary_data.user.email,
        "password": secretary_data.user.password,
        "is_active": secretary_data.user.is_active,
        "is_admin": secretary_data.user.is_admin,
    }
    db_secretary, db_user = service.create_person_with_user(
        person_data=person_data,
        user_data=user_data,
        role="secretary",
        PersonModel=SecretaryModel,
    )
    return SecretaryWithUserResponse(
        secretary_id=db_secretary.id,
        user_id=db_user.id,
        firstname=db_secretary.firstname,
        lastname=db_secretary.lastname,
        phone=db_secretary.phone,
        birth_date=db_secretary.birth_date,
        office_id=db_secretary.office_id,
        username=db_user.username,
        email=db_user.email,
        is_active=db_user.is_active,
        is_admin=db_user.is_admin,
    )


@router.get("", response_model=List[SecretarySchema])
async def get_secretaries(db: Session = Depends(get_db)):
    return db.query(SecretaryModel).all()


@router.get("/{secretary_id}", response_model=SecretarySchema)
async def get_secretary(secretary_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} not found")
    return db_secretary


@router.get("/{secretary_id}/trips", response_model=List[TripSchema])
async def get_secretary_trips(secretary_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} not found")
    return db.query(TripModel).filter(TripModel.secretary_id == secretary_id).all()


@router.get("/{secretary_id}/tickets", response_model=List[TicketSchema])
async def get_secretary_tickets(secretary_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} not found")
    return db.query(TicketModel).filter(TicketModel.secretary_id == secretary_id).all()


@router.delete("/{secretary_id}", response_model=Dict[str, str])
async def delete_secretary(secretary_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} not found")

    trips = db.query(TripModel).filter(TripModel.secretary_id == secretary_id).all()
    if trips:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(trips)} associated trips.")

    tickets = db.query(TicketModel).filter(TicketModel.secretary_id == secretary_id).all()
    if tickets:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(tickets)} associated tickets.")

    packages = db.query(PackageModel).filter(PackageModel.secretary_id == secretary_id).all()
    if packages:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(packages)} associated packages.")

    db.delete(db_secretary)
    db.commit()
    return {"message": f"Secretary with id {secretary_id} has been successfully deleted"}


@router.get("/{secretary_id}/user", response_model=UserSchema)
async def get_secretary_user(
    secretary_id: int,
    db: Session = Depends(get_db),
    _: UserModel = Depends(get_current_user),
):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} not found")
    if not db_secretary.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with id {secretary_id} is not linked to any user")

    db_user = db.query(UserModel).filter(UserModel.id == db_secretary.user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {db_secretary.user_id} not found")
    return db_user


@router.get("/by-user/{user_id}", response_model=SecretarySchema)
async def get_secretary_by_user_id(user_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == user_id).first()
    if not db_secretary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Secretary with user_id {user_id} not found")
    return db_secretary