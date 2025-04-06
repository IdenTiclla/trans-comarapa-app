from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.ticket import Ticket as TicketModel
from models.seat import Seat as SeatModel
from models.client import Client as ClientModel
from models.trip import Trip as TripModel
from models.bus import Bus as BusModel
from schemas.ticket import TicketCreate, Ticket as TicketSchema, TicketUpdate
from typing import List
from datetime import datetime, timedelta

router = APIRouter(
    tags=["Tickets"]
)


@router.get("", response_model=List[TicketSchema])
async def get_all_tickets(db: Session = Depends(get_db)):
    """Get all tickets without applying trip departure validation"""
    return db.query(TicketModel).all()


@router.get("/client/{client_id}", response_model=List[TicketSchema])
async def get_tickets_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get tickets by client ID"""
    tickets = db.query(TicketModel).filter(TicketModel.client_id == client_id).all()
    return tickets


@router.get("/seat/{seat_id}", response_model=List[TicketSchema])
async def get_tickets_by_seat(seat_id: int, db: Session = Depends(get_db)):
    """Get tickets by seat ID"""
    tickets = db.query(TicketModel).filter(TicketModel.seat_id == seat_id).all()
    return tickets

@router.get("/trip/{trip_id}", response_model=List[TicketSchema])
async def get_tickets_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get tickets by trip ID"""
    tickets = db.query(TicketModel).filter(TicketModel.trip_id == trip_id).all()
    return tickets

@router.get("/bus/{bus_id}", response_model=List[TicketSchema])
async def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    """Get tickets by bus ID"""
    tickets = db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketSchema)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a ticket by ID"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Ticket with id {ticket_id} not found"
        )
    return ticket

@router.post("", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket"""
    # 1. Verify that the seat exists
    seat = db.query(SeatModel).filter(SeatModel.id == ticket.seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {ticket.seat_id} not found"
        )
    
    # 2. Verify that the client exists
    client = db.query(ClientModel).filter(ClientModel.id == ticket.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {ticket.client_id} not found"
        )
    
    # 3. Verify that the trip exists
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {ticket.trip_id} not found"
        )
    
    # 4. Verify that the trip hasn't already departed
    min_departure = datetime.now() + timedelta(minutes=10)  # Allow a shorter window for tickets than trip creation
    if trip.trip_datetime < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trip with id {ticket.trip_id} has already departed on {trip.trip_datetime}"
        )
    
    # 5. Verify that the seat belongs to the bus assigned to the trip
    if seat.bus_id != trip.bus_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seat with id {ticket.seat_id} does not belong to the bus assigned to trip {ticket.trip_id}"
        )
    
    # 6. Verify that the seat is not already booked for the trip
    existing_ticket = db.query(TicketModel).filter(
        TicketModel.seat_id == ticket.seat_id, 
        TicketModel.trip_id == ticket.trip_id,
        TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
    ).first()
    
    if existing_ticket:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat with id {ticket.seat_id} is already booked for trip {ticket.trip_id}"
        )
    
    # 7. Verify that the client doesn't already have a ticket for this trip
    client_ticket = db.query(TicketModel).filter(
        TicketModel.client_id == ticket.client_id,
        TicketModel.trip_id == ticket.trip_id,
        TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
    ).first()
    
    if client_ticket:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Client with id {ticket.client_id} already has a ticket for trip {ticket.trip_id}"
        )
    
    # 8. Validate ticket state
    valid_states = ["pending", "confirmed", "cancelled", "completed"]
    if ticket.state.lower() not in valid_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ticket state: {ticket.state}. Valid states are: {', '.join(valid_states)}"
        )
    
    # Create the ticket with normalized state (lowercase)
    new_ticket = TicketModel(
        state=ticket.state.lower(),
        seat_id=ticket.seat_id,
        client_id=ticket.client_id,
        trip_id=ticket.trip_id
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    return new_ticket

@router.put("/{ticket_id}", response_model=TicketSchema)
async def update_ticket(ticket_id: int, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    """Update a ticket"""
    # Check if ticket exists
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Ticket with id {ticket_id} not found"
        )
    
    # Get the associated trip
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    if trip and trip.trip_datetime < datetime.now():
        # If the trip has already departed, only allow updating to 'completed' or 'cancelled'
        if ticket_update.state and ticket_update.state.lower() not in ["completed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trip has already departed. Ticket state can only be updated to 'completed' or 'cancelled'"
            )
    
    # If seat_id is being updated, verify the seat exists and is available
    if ticket_update.seat_id and ticket_update.seat_id != ticket.seat_id:
        # Verify that the seat exists
        seat = db.query(SeatModel).filter(SeatModel.id == ticket_update.seat_id).first()
        if not seat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Seat with id {ticket_update.seat_id} not found"
            )
        
        # Verify that the seat belongs to the bus assigned to the trip
        if seat.bus_id != trip.bus_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Seat with id {ticket_update.seat_id} does not belong to the bus assigned to trip {ticket.trip_id}"
            )
        
        # Verify that the seat is not already booked for the trip
        existing_ticket = db.query(TicketModel).filter(
            TicketModel.seat_id == ticket_update.seat_id,
            TicketModel.trip_id == ticket.trip_id,
            TicketModel.id != ticket_id,  # Exclude the current ticket
            TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
        ).first()
        
        if existing_ticket:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat with id {ticket_update.seat_id} is already booked for trip {ticket.trip_id}"
            )
    
    # If client_id is being updated, verify the client exists
    if ticket_update.client_id and ticket_update.client_id != ticket.client_id:
        client = db.query(ClientModel).filter(ClientModel.id == ticket_update.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {ticket_update.client_id} not found"
            )
        
        # Verify that the client doesn't already have a ticket for this trip
        client_ticket = db.query(TicketModel).filter(
            TicketModel.client_id == ticket_update.client_id,
            TicketModel.trip_id == ticket.trip_id,
            TicketModel.id != ticket_id,  # Exclude the current ticket
            TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
        ).first()
        
        if client_ticket:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Client with id {ticket_update.client_id} already has a ticket for trip {ticket.trip_id}"
            )
    
    # Convert ticket_update to dict, processing only non-None values
    update_data = {k: v for k, v in ticket_update.model_dump().items() if v is not None}
    
    # If state is being updated, convert to lowercase
    if "state" in update_data:
        update_data["state"] = update_data["state"].lower()
    
    # Update the ticket
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    db.commit() 
    db.refresh(ticket)
    
    return ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Ticket with id {ticket_id} not found"
        )
    
    db.delete(ticket)
    db.commit()
    return {
        "message": "Ticket deleted successfully", 
        "status_code": status.HTTP_204_NO_CONTENT
    }

