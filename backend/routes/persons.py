from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from db.session import get_db
from models.person import Person
from models.driver import Driver
from models.client import Client
from models.secretary import Secretary
from models.user import User
from schemas.person import (
    PersonResponse, PersonUpdate, PersonCreate,
    DriverResponse, ClientResponse, SecretaryResponse,
    AssistantResponse, AdministratorResponse,
    DriverUpdate, ClientUpdate, PersonType,
)
from auth.jwt import get_current_user, get_current_admin_user
from services.persons_service import PersonsService

router = APIRouter(prefix="/persons", tags=["Persons"])


def get_service(db: Session = Depends(get_db)) -> PersonsService:
    return PersonsService(db)


@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: int,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(person_id, current_user)


@router.get("/by-user/{user_id}", response_model=PersonResponse)
async def get_person_by_user_id(
    user_id: int,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_user_id(user_id, current_user)


@router.put("/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: int,
    person_data: PersonUpdate,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(person_id, person_data.model_dump(exclude_unset=True), current_user)


@router.get("/", response_model=List[PersonResponse])
async def list_persons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    person_type: Optional[PersonType] = Query(None),
    search: Optional[str] = Query(None),
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.list_persons(skip=skip, limit=limit, person_type=person_type, search=search)


@router.post("/", response_model=PersonResponse)
async def create_person(
    person_data: PersonCreate,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.create(person_data.model_dump())


@router.get("/drivers/", response_model=List[DriverResponse])
async def list_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.list_drivers(skip=skip, limit=limit, status_filter=status_filter)


@router.get("/clients/", response_model=List[ClientResponse])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    city: Optional[str] = Query(None),
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.list_clients(skip=skip, limit=limit, city=city)


@router.get("/secretaries/", response_model=List[SecretaryResponse])
async def list_secretaries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    office_id: Optional[int] = Query(None),
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.list_secretaries(skip=skip, limit=limit, office_id=office_id)


@router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update_driver(driver_id, driver_data.model_dump(exclude_unset=True), current_user)


@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update_client(client_id, client_data.model_dump(exclude_unset=True), current_user)


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_person(
    person_id: int,
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    service.delete(person_id)


@router.get("/stats/summary", response_model=dict)
async def get_persons_stats(
    service: PersonsService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.get_stats()
