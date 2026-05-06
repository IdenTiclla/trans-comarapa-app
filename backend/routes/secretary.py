from typing import List, Dict

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.secretary import Secretary as SecretaryModel
from models.user import User as UserModel
from schemas.secretary import Secretary as SecretarySchema
from schemas.trip import Trip as TripSchema
from schemas.ticket import Ticket as TicketSchema
from schemas.secretary_with_user import SecretaryWithUser, SecretaryWithUserResponse
from schemas.auth import User as UserSchema
from auth.jwt import get_current_admin_user, get_current_user
from services.secretary_service import SecretaryService
from services.person_service import PersonService

router = APIRouter(tags=["Secretaries"])


def get_secretary_service(db: Session = Depends(get_db)) -> SecretaryService:
    return SecretaryService(db)


def get_person_service(db: Session = Depends(get_db)) -> PersonService:
    return PersonService(db)


@router.post("", response_model=SecretaryWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_secretary_with_user(
    secretary_data: SecretaryWithUser,
    service: PersonService = Depends(get_person_service),
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
async def get_secretaries(
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.get_all()


@router.get("/{secretary_id}", response_model=SecretarySchema)
async def get_secretary(
    secretary_id: int,
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.get_by_id(secretary_id)


@router.patch("/{secretary_id}", response_model=SecretarySchema)
async def update_secretary(
    secretary_id: int,
    data: dict,
    service: SecretaryService = Depends(get_secretary_service),
    _: UserModel = Depends(get_current_admin_user),
):
    return service.update(secretary_id, data)


@router.get("/{secretary_id}/trips", response_model=List[TripSchema])
async def get_secretary_trips(
    secretary_id: int,
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.get_trips(secretary_id)


@router.get("/{secretary_id}/tickets", response_model=List[TicketSchema])
async def get_secretary_tickets(
    secretary_id: int,
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.get_tickets(secretary_id)


@router.delete("/{secretary_id}", response_model=Dict[str, str])
async def delete_secretary(
    secretary_id: int,
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.delete(secretary_id)


@router.get("/{secretary_id}/user", response_model=UserSchema)
async def get_secretary_user(
    secretary_id: int,
    service: SecretaryService = Depends(get_secretary_service),
    _: UserModel = Depends(get_current_user),
):
    return service.get_user(secretary_id)


@router.get("/by-user/{user_id}", response_model=SecretarySchema)
async def get_secretary_by_user_id(
    user_id: int,
    service: SecretaryService = Depends(get_secretary_service),
):
    return service.get_by_user_id(user_id)
