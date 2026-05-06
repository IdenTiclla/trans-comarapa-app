from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from schemas.administrator import Administrator as AdministratorSchema
from schemas.administrator_with_user import AdministratorWithUser, AdministratorWithUserResponse
from auth.jwt import get_current_admin_user
from services.administrator_service import AdministratorService
from services.person_service import PersonService
from models.administrator import Administrator as AdministratorModel

router = APIRouter(tags=["Administrators"])


def get_admin_service(db: Session = Depends(get_db)) -> AdministratorService:
    return AdministratorService(db)


def get_person_service(db: Session = Depends(get_db)) -> PersonService:
    return PersonService(db)


@router.post("", response_model=AdministratorWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_administrator_with_user(
    administrator_data: AdministratorWithUser,
    service: PersonService = Depends(get_person_service),
):
    person_data = {
        "firstname": administrator_data.firstname,
        "lastname": administrator_data.lastname,
        "phone": administrator_data.phone,
        "birth_date": administrator_data.birth_date,
    }
    user_data = {
        "username": administrator_data.user.username,
        "email": administrator_data.user.email,
        "password": administrator_data.user.password,
        "is_active": administrator_data.user.is_active,
        "is_admin": administrator_data.user.is_admin,
    }
    db_administrator, db_user = service.create_person_with_user(
        person_data=person_data,
        user_data=user_data,
        role="admin",
        PersonModel=AdministratorModel,
    )
    return AdministratorWithUserResponse(
        administrator_id=db_administrator.id,
        user_id=db_user.id,
        firstname=db_administrator.firstname,
        lastname=db_administrator.lastname,
        phone=db_administrator.phone,
        birth_date=db_administrator.birth_date,
        username=db_user.username,
        email=db_user.email,
        is_active=db_user.is_active,
        is_admin=db_user.is_admin,
    )


@router.get("", response_model=List[AdministratorSchema])
async def get_administrators(
    service: AdministratorService = Depends(get_admin_service),
    _: User = Depends(get_current_admin_user),
):
    return service.get_all()


@router.get("/{administrator_id}", response_model=AdministratorSchema)
async def get_administrator(
    administrator_id: int,
    service: AdministratorService = Depends(get_admin_service),
    _: User = Depends(get_current_admin_user),
):
    return service.get_by_id(administrator_id)
