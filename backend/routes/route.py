"""
Route routes — thin adapter layer. All business logic lives in RouteService.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from schemas.route import RouteCreate, Route as RouteSchema, RouteUpdate, RouteWithSchedules
from schemas.route_schedule import RouteScheduleCreate, RouteSchedule as RouteScheduleSchema, RouteScheduleUpdate
from schemas.trip import Trip as TripSchema
from auth.jwt import get_current_admin_user
from services.route_service import RouteService

router = APIRouter(tags=["Routes"])


def get_service(db: Session = Depends(get_db)) -> RouteService:
    return RouteService(db)


@router.post("", response_model=RouteSchema, status_code=status.HTTP_201_CREATED)
def create_route(
    route: RouteCreate,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.create_route(route)


@router.get("", response_model=List[RouteSchema])
def get_routes(
    skip: int = 0,
    limit: int = 100,
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    service: RouteService = Depends(get_service),
):
    return service.get_all(skip=skip, limit=limit, origin=origin, destination=destination,
                           min_price=min_price, max_price=max_price)


@router.get("/with-schedules", response_model=List[RouteWithSchedules])
def get_routes_with_schedules(service: RouteService = Depends(get_service)):
    return service.get_all_with_schedules()


@router.get("/{route_id}", response_model=RouteSchema)
def get_route(route_id: int, service: RouteService = Depends(get_service)):
    return service.get_by_id(route_id)


@router.patch("/{route_id}", response_model=RouteSchema)
def update_route(
    route_id: int,
    route_update: RouteUpdate,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.update_route(route_id, route_update)


@router.delete("/{route_id}", response_model=RouteSchema)
def delete_route(
    route_id: int,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.delete_route(route_id)


@router.get("/{route_id}/schedules", response_model=List[RouteScheduleSchema])
def get_route_schedules(route_id: int, service: RouteService = Depends(get_service)):
    return service.get_schedules(route_id)


@router.post("/{route_id}/schedules", response_model=RouteScheduleSchema, status_code=status.HTTP_201_CREATED)
def create_route_schedule(
    route_id: int,
    schedule: RouteScheduleCreate,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.create_schedule(route_id, schedule)


@router.patch("/{route_id}/schedules/{schedule_id}", response_model=RouteScheduleSchema)
def update_route_schedule(
    route_id: int,
    schedule_id: int,
    schedule_update: RouteScheduleUpdate,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    return service.update_schedule(route_id, schedule_id, schedule_update)


@router.delete("/{route_id}/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route_schedule(
    route_id: int,
    schedule_id: int,
    service: RouteService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user),
):
    service.delete_schedule(route_id, schedule_id)


@router.get("/{route_id}/trips", response_model=List[TripSchema])
def get_trips_by_route(route_id: int, service: RouteService = Depends(get_service)):
    return service.get_trips_by_route(route_id)
