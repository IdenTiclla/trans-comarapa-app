from fastapi import APIRouter, status, Depends, HTTPException
from models.bus import Bus as BusModel
from schemas.bus import BusCreate, Bus as BusSchema
from sqlalchemy.orm import Session
from db.session import get_db
from models.seat import Seat as SeatModel
from schemas.seat import Seat as SeatSchema
from models.ticket import Ticket as TicketModel
from schemas.ticket import Ticket as TicketSchema
from models.trip import Trip as TripModel
from schemas.trip import Trip as TripSchema
from models.client import Client as ClientModel
from schemas.client import Client as ClientSchema


router = APIRouter(
    prefix='/busses',
    tags=['Busses']
)
@router.get('',
    response_model=list[BusSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all Buses.",
    description="This endpoint is used to see all buses infomation."
)
def get_all_busses(db: Session = Depends(get_db)):
    buses = db.query(BusModel).all()
    return buses

@router.post('',
    response_model=BusSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bus.",
    description="This endpoint is used for creating a new bus."
)
def create_new_bus(bus: BusCreate, db: Session = Depends(get_db)):
    bus_with_existing_license_plate = db.query(BusModel).filter(BusModel.license_plate == bus.license_plate).first()
    if bus_with_existing_license_plate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License plate is already taken."
        )
    new_bus = BusModel(
        license_plate=bus.license_plate,
        capacity=bus.capacity,
        model=bus.model
    )
    db.add(new_bus)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating a new Bus."
        )
    db.refresh(new_bus)
    return new_bus

@router.delete('/{bus_id}',
    response_model=BusSchema,
)
def delete_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )
    # Check if the bus has any seats
    if db.query(SeatModel).filter(SeatModel.bus_id == bus_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has seats and cannot be deleted."
        )
    # Check if the bus has any tickets
    if db.query(TicketModel).filter(TicketModel.bus_id == bus_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has tickets and cannot be deleted."
        )
    # Check if the bus has any trips
    if db.query(TripModel).filter(TripModel.bus_id == bus_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has trips and cannot be deleted."
        )
    # Check if the bus has any clients
    if db.query(ClientModel).filter(ClientModel.bus_id == bus_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has clients and cannot be deleted."
        )
    
    db.delete(bus)
    db.commit()
    return bus

@router.get("/{bus_id}", response_model=BusSchema)
def get_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )
    return bus

@router.put("/{bus_id}", response_model=BusSchema)
def update_single_bus(bus_id: int, bus: BusCreate, db: Session = Depends(get_db)):
    bus_data = bus.model_dump()
    bus_data["id"] = bus_id
    db.query(BusModel).filter(BusModel.id == bus_id).update(bus_data)
    db.commit() 
    return bus_data

@router.delete("/{bus_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )
    db.delete(bus)
    db.commit()
    return None

@router.get("/{bus_id}/seats", response_model=list[SeatSchema])
def get_seats_by_bus(bus_id: int, db: Session = Depends(get_db)):
    seats = db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
    return seats

@router.get("/{bus_id}/tickets", response_model=list[TicketSchema])
def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    tickets = db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()
    return tickets

@router.get("/{bus_id}/trips", response_model=list[TripSchema])
def get_trips_by_bus(bus_id: int, db: Session = Depends(get_db)):
    trips = db.query(TripModel).filter(TripModel.bus_id == bus_id).all()
    return trips

