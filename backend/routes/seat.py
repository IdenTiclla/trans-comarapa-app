import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.seat import Seat as SeatModel
from models.bus import Bus as BusModel
from schemas.seat import SeatCreate, Seat as SeatSchema, SeatUpdate
from models.ticket import Ticket as TicketModel
from typing import List
from auth.jwt import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Seats"]
)

@router.post("", response_model=SeatSchema, status_code=status.HTTP_201_CREATED)
async def create_seat(
    seat: SeatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new seat"""
    bus = db.query(BusModel).filter(BusModel.id == seat.bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus with id {seat.bus_id} not found"
        )
    
    if seat.seat_number <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat number must be a positive integer"
        )
    
    existing_seat = db.query(SeatModel).filter(
        SeatModel.bus_id == seat.bus_id,
        SeatModel.seat_number == seat.seat_number,
        SeatModel.deck == seat.deck
    ).first()
    
    if existing_seat:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat number {seat.seat_number} on deck {seat.deck} already exists for bus {seat.bus_id}"
        )
    
    bus_capacity = bus.capacity
    total_seats = db.query(SeatModel).filter(SeatModel.bus_id == seat.bus_id).count()
    if total_seats >= bus_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bus with id {seat.bus_id} has reached its capacity of {bus_capacity} seats"
        )
        
    new_seat = SeatModel(
        bus_id=seat.bus_id,
        seat_number=seat.seat_number,
        deck=seat.deck
    )
    
    db.add(new_seat)
    db.commit()
    db.refresh(new_seat)
    
    return new_seat

@router.get("", response_model=List[SeatSchema])
async def get_all_seats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all seats"""
    seats = db.query(SeatModel).all()
    return seats

@router.get("/{seat_id}", response_model=SeatSchema)
async def get_seat(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a seat by ID"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    return seat

@router.put("/{seat_id}", response_model=SeatSchema)
async def update_seat(
    seat_id: int,
    seat_update: SeatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a seat"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    
    has_tickets = db.query(TicketModel).filter(TicketModel.seat_id == seat_id).first() is not None
    if has_tickets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update seat with id {seat_id} because it has associated tickets"
        )
    
    if seat_update.bus_id:
        bus = db.query(BusModel).filter(BusModel.id == seat_update.bus_id).first()
        if not bus:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bus with id {seat_update.bus_id} not found"
            )
            
        if seat_update.bus_id != seat.bus_id:
            bus_capacity = bus.capacity
            total_seats = db.query(SeatModel).filter(SeatModel.bus_id == seat_update.bus_id).count()
            if total_seats >= bus_capacity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bus with id {seat_update.bus_id} has reached its capacity of {bus_capacity} seats"
                )
    
    if (seat_update.seat_number and seat_update.seat_number != seat.seat_number) or \
       (seat_update.deck and seat_update.deck != seat.deck):
        check_seat_number = seat_update.seat_number if seat_update.seat_number is not None else seat.seat_number
        check_deck = seat_update.deck if seat_update.deck is not None else seat.deck
        check_bus_id = seat_update.bus_id if seat_update.bus_id is not None else seat.bus_id
        
        existing_seat = db.query(SeatModel).filter(
            SeatModel.bus_id == check_bus_id,
            SeatModel.seat_number == check_seat_number,
            SeatModel.deck == check_deck,
            SeatModel.id != seat_id
        ).first()
        
        if existing_seat:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat number {check_seat_number} on deck {check_deck} already exists for bus {check_bus_id}"
            )
    
    for var, value in vars(seat_update).items():
        if value is not None:
            setattr(seat, var, value)
    
    db.commit()
    db.refresh(seat)
    
    return seat

@router.delete("/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seat(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a seat"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {seat_id} not found"
        )
    
    tickets = db.query(TicketModel).filter(TicketModel.seat_id == seat_id).all()
    if tickets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete seat with id {seat_id} because it has {len(tickets)} associated tickets. Delete the tickets first."
        )
    
    db.delete(seat)
    db.commit()
    
    return None

@router.get("/bus/{bus_id}", response_model=List[SeatSchema])
async def get_seats_by_bus(
    bus_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get seats by bus ID"""
    seats = db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
    return seats

@router.get("/trip/{trip_id}", response_model=List[SeatSchema])
async def get_seats_by_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get seats by trip ID"""
    seats = db.query(SeatModel).join(
        TicketModel, 
        TicketModel.seat_id == SeatModel.id
    ).filter(
        TicketModel.trip_id == trip_id
    ).all()
    
    return seats
