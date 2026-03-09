"""
Bus routes — thin adapter layer. All business logic lives in BusService.
"""

from typing import List

from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.bus import BusCreate, Bus as BusSchema, BusWithSeatsCreate, SeatLayoutItem
from schemas.seat import Seat as SeatSchema, SeatSimple
from schemas.ticket import Ticket as TicketSchema
from schemas.trip import Trip as TripSchema
from models.seat import Seat as SeatModel
from models.ticket import Ticket as TicketModel
from models.trip import Trip as TripModel
from services.bus_service import BusService

router = APIRouter(tags=["Busses"])


def get_service(db: Session = Depends(get_db)) -> BusService:
    return BusService(db)


@router.get("", response_model=list[BusSchema], status_code=status.HTTP_200_OK,
            summary="Get all Buses.")
def get_all_busses(service: BusService = Depends(get_service)):
    return service.get_all()


@router.post("", response_model=BusSchema, status_code=status.HTTP_201_CREATED,
             summary="Create a new bus.")
def create_new_bus(bus: BusCreate, service: BusService = Depends(get_service)):
    return service.create_bus(bus)


@router.post("/with-seats", response_model=BusSchema, status_code=status.HTTP_201_CREATED,
             summary="Create a new bus with seat layout.",
             description="Creates a bus with its complete seat layout atomically.")
def create_bus_with_seats(bus_data: BusWithSeatsCreate, service: BusService = Depends(get_service)):
    return service.create_bus_with_seats(bus_data)


@router.delete("/{bus_id}", response_model=BusSchema, status_code=status.HTTP_200_OK,
               summary="Delete a bus.",
               description="Deletes a bus and its seats. Cannot delete if the bus has trips or tickets.")
def delete_single_bus(bus_id: int, service: BusService = Depends(get_service)):
    return service.delete_bus(bus_id)


@router.get("/{bus_id}", response_model=BusSchema)
def get_single_bus(bus_id: int, service: BusService = Depends(get_service)):
    return service.get_by_id(bus_id)


@router.put("/{bus_id}", response_model=BusSchema)
def update_single_bus(bus_id: int, bus: BusCreate, service: BusService = Depends(get_service)):
    return service.update_bus(bus_id, bus)


@router.put("/{bus_id}/seats", response_model=List[SeatSimple], status_code=status.HTTP_200_OK,
            summary="Update bus seat layout.",
            description="Replaces all seats of a bus with a new layout. Cannot be used if tickets exist.")
def update_bus_seats(bus_id: int, seats: List[SeatLayoutItem], service: BusService = Depends(get_service)):
    return service.update_bus_seats(bus_id, seats)


@router.get("/{bus_id}/seats", response_model=list[SeatSchema])
def get_seats_by_bus(bus_id: int, db: Session = Depends(get_db)):
    return db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()


@router.get("/{bus_id}/tickets", response_model=list[TicketSchema])
def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    return db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()


@router.get("/{bus_id}/trips", response_model=list[TripSchema])
def get_trips_by_bus(bus_id: int, db: Session = Depends(get_db)):
    return db.query(TripModel).filter(TripModel.bus_id == bus_id).all()
