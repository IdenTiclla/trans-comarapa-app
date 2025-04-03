from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.ticket import Ticket as TicketModel
from models.seat import Seat as SeatModel
from models.client import Client as ClientModel
from models.trip import Trip as TripModel
from schemas.ticket import TicketCreate, Ticket as TicketSchema, TicketUpdate

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


@router.get("", response_model=list[TicketSchema])
def get_all_tickets(db: Session = Depends(get_db)):
    """Get all tickets"""
    return db.query(TicketModel).all()



@router.get("/client/{client_id}", response_model=list[TicketSchema])
def get_tickets_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get tickets by client ID"""
    tickets = db.query(TicketModel).filter(TicketModel.client_id == client_id).all()
    return tickets


@router.get("/seat/{seat_id}", response_model=list[TicketSchema])
def get_tickets_by_seat(seat_id: int, db: Session = Depends(get_db)):
    """Get tickets by seat ID"""
    tickets = db.query(TicketModel).filter(TicketModel.seat_id == seat_id).all()
    return tickets

@router.get("/trip/{trip_id}", response_model=list[TicketSchema])
def get_tickets_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get tickets by trip ID"""
    tickets = db.query(TicketModel).filter(TicketModel.trip_id == trip_id).all()
    return tickets

@router.get("/bus/{bus_id}", response_model=list[TicketSchema])
def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    """Get tickets by bus ID"""
    tickets = db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a ticket by ID"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket"""
    # Verify that the seat is available
    seat = db.query(SeatModel).filter(SeatModel.id == ticket.seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {ticket.seat_id} not found"
        )
    
    # Verify that the client exists
    client = db.query(ClientModel).filter(ClientModel.id == ticket.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {ticket.client_id} not found"
        )
    
    # Verify that the trip exists
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {ticket.trip_id} not found"
        )
    
    # Create the ticket
    new_ticket = TicketModel(**ticket.model_dump())
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    return new_ticket

@router.put("/{ticket_id}", response_model=TicketSchema)
def update_ticket(ticket_id: int, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    """Update a ticket"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    for field, value in ticket_update.model_dump().items():
        setattr(ticket, field, value)
    
    db.commit() 
    db.refresh(ticket)
    
    return ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket deleted successfully", "status_code": status.HTTP_204_NO_CONTENT, "ticket": ticket}

