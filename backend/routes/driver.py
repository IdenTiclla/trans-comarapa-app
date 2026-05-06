from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.driver import DriverCreate, DriverPatch, Driver as DriverSchema
from services.driver_service import DriverService

router = APIRouter(tags=["Drivers"])


def get_service(db: Session = Depends(get_db)) -> DriverService:
    return DriverService(db)


@router.post("", response_model=DriverSchema, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver: DriverCreate,
    service: DriverService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create(driver.model_dump())


@router.get("", response_model=list[DriverSchema])
def get_all_drivers(
    service: DriverService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_all()


@router.get("/{driver_id}", response_model=DriverSchema)
def get_specific_driver(
    driver_id: int,
    service: DriverService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(driver_id)


@router.patch("/{driver_id}", response_model=DriverSchema)
def patch_specific_driver(
    driver: DriverPatch,
    driver_id: int,
    service: DriverService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(driver_id, driver.dict(exclude_unset=True))


@router.delete("/{driver_id}", response_model=DriverSchema)
def delete_specific_driver(
    driver_id: int,
    service: DriverService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.delete(driver_id)
