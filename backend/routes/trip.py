from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, Optional

from db.session import get_db
from schemas.trip import TripCreate, TripUpdate, Trip as TripSchema
from schemas.driver import Driver as DriverSchema
from schemas.assistant import Assistant as AssistantSchema
from services.trip_service import TripService

router = APIRouter(tags=["trips"])


def get_service(db: Session = Depends(get_db)) -> TripService:
    return TripService(db)


@router.get("/", response_model=Dict[str, Any])
async def get_trips(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    upcoming: bool = Query(False, description="Filter for upcoming trips only"),
    search: Optional[str] = Query(None, description="Search by trip ID, origin, or destination"),
    origin: Optional[str] = Query(None, description="Filter by origin location name"),
    destination: Optional[str] = Query(None, description="Filter by destination location name"),
    date_from: Optional[datetime] = Query(None, description="Filter by minimum departure date"),
    date_to: Optional[datetime] = Query(None, description="Filter by maximum departure date"),
    status: Optional[str] = Query(None, description="Filter by trip status (comma-separated list)"),
    min_seats: Optional[int] = Query(None, description="Filter by minimum available seats"),
    sort_by: str = Query("trip_datetime", description="Field to sort by"),
    sort_direction: str = Query("asc", description="Sort direction (asc or desc)"),
    service: TripService = Depends(get_service)
):
    return service.get_trips(
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        upcoming=upcoming,
        origin=origin,
        destination=destination,
        date_from=date_from,
        date_to=date_to,
        min_seats=min_seats,
        sort_by=sort_by,
        sort_direction=sort_direction
    )


@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate, service: TripService = Depends(get_service)):
    return service.create_trip(trip)


@router.get("/{trip_id}", response_model=Dict[str, Any])
def get_trip(trip_id: int, service: TripService = Depends(get_service)):
    return service.get_trip_detail(trip_id)


@router.get("/{trip_id}/driver", response_model=DriverSchema)
def get_trip_driver(trip_id: int, service: TripService = Depends(get_service)):
    return service.get_trip_driver(trip_id)


@router.get("/{trip_id}/assistant", response_model=AssistantSchema)
def get_trip_assistant(trip_id: int, service: TripService = Depends(get_service)):
    return service.get_trip_assistant(trip_id)


@router.get("/{trip_id}/available-seats")
async def get_available_seats(trip_id: int, service: TripService = Depends(get_service)):
    return service.get_available_seats(trip_id)


@router.put("/{trip_id}", response_model=Dict[str, Any])
async def update_trip(trip_id: int, trip_update: TripUpdate, service: TripService = Depends(get_service)):
    service.update_trip(trip_id, trip_update)
    return service.get_trip_detail(trip_id)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: int, service: TripService = Depends(get_service)):
    service.delete_trip(trip_id)
    return {"message": "Trip deleted successfully", "status_code": status.HTTP_204_NO_CONTENT}

@router.post("/{trip_id}/dispatch", response_model=Dict[str, Any])
async def dispatch_trip(trip_id: int, service: TripService = Depends(get_service)):
    service.dispatch_trip(trip_id)
    return service.get_trip_detail(trip_id)

@router.post("/{trip_id}/finish", response_model=Dict[str, Any])
async def finish_trip(trip_id: int, service: TripService = Depends(get_service)):
    service.finish_trip(trip_id)
    return service.get_trip_detail(trip_id)

@router.post("/{trip_id}/cancel", response_model=Dict[str, Any])
async def cancel_trip(trip_id: int, service: TripService = Depends(get_service)):
    service.cancel_trip(trip_id)
    return service.get_trip_detail(trip_id)
