from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.location import LocationCreate, Location as LocationSchema, LocationUpdate
from services.location_service import LocationService

router = APIRouter(tags=["Locations"])


def get_service(db: Session = Depends(get_db)) -> LocationService:
    return LocationService(db)


@router.post("", response_model=LocationSchema, status_code=status.HTTP_201_CREATED)
def create_location(
    location: LocationCreate,
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create(location.model_dump())


@router.get("", response_model=List[LocationSchema])
def get_locations(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_all(skip=skip, limit=limit, search=search, city=city, state=state)


@router.get("/search-destinations", response_model=List[LocationSchema])
def search_destinations(
    search: str = Query(..., description="Search term for destination names"),
    origin_location_id: Optional[int] = Query(None, description="Filter by origin location ID"),
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.search_destinations(search, origin_location_id)


@router.get("/{location_id}", response_model=LocationSchema)
def get_location(
    location_id: int,
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(location_id)


@router.patch("/{location_id}", response_model=LocationSchema)
def update_location(
    location_id: int,
    location_update: LocationUpdate,
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(location_id, location_update.model_dump(exclude_unset=True))


@router.delete("/{location_id}", response_model=LocationSchema)
def delete_location(
    location_id: int,
    service: LocationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.delete(location_id)
