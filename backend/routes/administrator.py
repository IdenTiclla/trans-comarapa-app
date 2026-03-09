"""
Administrator routes — thin adapter layer. Creation logic lives in PersonService.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.administrator import Administrator as AdministratorModel
from models.user import User as UserModel
from schemas.administrator import Administrator as AdministratorSchema
from schemas.administrator_with_user import AdministratorWithUser, AdministratorWithUserResponse
from auth.jwt import get_current_admin_user
from services.person_service import PersonService

router = APIRouter(tags=["Administrators"])


def get_service(db: Session = Depends(get_db)) -> PersonService:
    return PersonService(db)


@router.post("", response_model=AdministratorWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_administrator_with_user(
    administrator_data: AdministratorWithUser,
    service: PersonService = Depends(get_service),
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
async def get_administrators(db: Session = Depends(get_db), _: UserModel = Depends(get_current_admin_user)):
    return db.query(AdministratorModel).all()


@router.get("/{administrator_id}", response_model=AdministratorSchema)
async def get_administrator(
    administrator_id: int,
    db: Session = Depends(get_db),
    _: UserModel = Depends(get_current_admin_user),
):
    administrator = db.query(AdministratorModel).filter(AdministratorModel.id == administrator_id).first()
    if not administrator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Administrator with ID {administrator_id} not found")
    return administrator
