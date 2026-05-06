from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.seat import SeatCreate, Seat as SeatSchema, SeatUpdate
from services.seat_service import SeatService

router = APIRouter(tags=["Seats"])


def get_service(db: Session = Depends(get_db)) -> SeatService:
    return SeatService(db)


@router.post("", response_model=SeatSchema, status_code=status.HTTP_201_CREATED)
async def create_seat(
    seat: SeatCreate,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create(seat.model_dump())


@router.get("", response_model=List[SeatSchema])
async def get_all_seats(
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_all()


@router.get("/{seat_id}", response_model=SeatSchema)
async def get_seat(
    seat_id: int,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(seat_id)


@router.put("/{seat_id}", response_model=SeatSchema)
async def update_seat(
    seat_id: int,
    seat_update: SeatUpdate,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(seat_id, seat_update.model_dump())


@router.delete("/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seat(
    seat_id: int,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    service.delete(seat_id)


@router.get("/bus/{bus_id}", response_model=List[SeatSchema])
async def get_seats_by_bus(
    bus_id: int,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_bus(bus_id)


@router.get("/trip/{trip_id}", response_model=List[SeatSchema])
async def get_seats_by_trip(
    trip_id: int,
    service: SeatService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_trip(trip_id)
