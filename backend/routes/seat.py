from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.seat import Seat as SeatModel
from models.bus import Bus as BusModel
from schemas.seat import SeatCreate, Seat as SeatSchema, SeatUpdate
from models.ticket import Ticket as TicketModel

router = APIRouter(
    prefix="/seats",
    tags=["Seats"]
)

@router.post("", response_model=SeatSchema, status_code=status.HTTP_201_CREATED)
def create_seat(seat: SeatCreate, db: Session = Depends(get_db)):
    """Create a new seat"""
    # Verify that the bus exists
    bus = db.query(BusModel).filter(BusModel.id == seat.bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus with id {seat.bus_id} not found"
        )
    
    # Create the seat
    new_seat = SeatModel(
        bus_id=seat.bus_id,
        seat_number=seat.seat_number,
        deck=seat.deck
    )
    
    db.add(new_seat)
    db.commit()
    db.refresh(new_seat)
    
    return new_seat

@router.get("", response_model=list[SeatSchema])
def get_all_seats(db: Session = Depends(get_db)):
    """Get all seats"""
    seats = db.query(SeatModel).all()
    return seats

@router.get("/{seat_id}", response_model=SeatSchema)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    """Get a seat by ID"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    return seat

@router.put("/{seat_id}", response_model=SeatSchema)
def update_seat(seat_id: int, seat_update: SeatUpdate, db: Session = Depends(get_db)):
    """Update a seat"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    
    # Verify that the bus exists if bus_id is being updated
    if seat_update.bus_id:
        bus = db.query(BusModel).filter(BusModel.id == seat_update.bus_id).first()
        if not bus:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bus with id {seat_update.bus_id} not found"
            )
    
    # Update the seat
    for var, value in vars(seat_update).items():
        if value is not None:
            setattr(seat, var, value)
    
    db.commit()
    db.refresh(seat)
    
    return seat

@router.delete("/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seat(seat_id: int, db: Session = Depends(get_db)):
    """Delete a seat"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    
    db.delete(seat)
    db.commit()
    
    return None 

@router.get("/bus/{bus_id}", response_model=list[SeatSchema])
def get_seats_by_bus(bus_id: int, db: Session = Depends(get_db)):
    """Get seats by bus ID"""
    seats = db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
    return seats

@router.get("/trip/{trip_id}", response_model=list[SeatSchema])
def get_seats_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get seats by trip ID"""
    # We need to join with tickets to find seats for a trip
    # since Seat doesn't have a direct trip_id attribute
    
    # Find seats that have tickets for this trip
    seats = db.query(SeatModel).join(
        TicketModel, 
        TicketModel.seat_id == SeatModel.id
    ).filter(
        TicketModel.trip_id == trip_id
    ).all()
    
    return seats
