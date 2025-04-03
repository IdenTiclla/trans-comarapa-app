from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from models.client import Client as ClientModel
from schemas.client import ClientCreate, ClientUpdate, Client as ClientSchema
from db.session import get_db
from models.ticket import Ticket as TicketModel
from schemas.ticket import Ticket as TicketSchema, TicketCreate, TicketUpdate, ClientTicketCreate
from models.seat import Seat as SeatModel
from schemas.seat import Seat as SeatSchema

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)

@router.get("", response_model=list[ClientSchema])
def get_all_clients(db: Session = Depends(get_db)):
    """Get all clients"""
    clients = db.query(ClientModel).all()
    return clients


@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a client by ID"""
    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=ClientSchema)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    new_client = ClientModel(**client.model_dump())
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    """Update a client"""
    client_data = client.model_dump()
    client_data["id"] = client_id
    db.query(ClientModel).filter(ClientModel.id == client_id).update(client_data)
    db.commit()
    return client_data

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    db.query(ClientModel).filter(ClientModel.id == client_id).delete()
    db.commit()



@router.get("/{client_id}/tickets", response_model=list[TicketSchema])
def get_client_tickets(client_id: int, db: Session = Depends(get_db)):
    """Get all tickets for a client"""
    tickets = db.query(TicketModel).filter(TicketModel.client_id == client_id).all()
    if not tickets:
        raise HTTPException(status_code=404, detail="No tickets found for this client")
    return tickets

@router.get("/{client_id}/tickets/{ticket_id}", response_model=TicketSchema)
def get_client_ticket(client_id: int, ticket_id: int, db: Session = Depends(get_db)):
    """Get a ticket for a client"""
    ticket = db.query(TicketModel).filter(TicketModel.client_id == client_id, TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket


@router.post("/{client_id}/tickets", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_client_ticket(client_id: int, ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket for a client"""
    # Verify that the client exists
    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Get the ticket data as a dictionary
    ticket_data = ticket.model_dump()
    
    # Verify that the client_id in the path matches the one in the request body
    # If not, raise an exception to prevent confusion
    if ticket_data.get("client_id") != client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Client ID in path ({client_id}) does not match client ID in request body ({ticket_data.get('client_id')})"
        )
    
    # Create the ticket with the validated data
    new_ticket = TicketModel(**ticket_data)
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)  
    return new_ticket

@router.post("/{client_id}/tickets", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_client_ticket_simplified(client_id: int, ticket: ClientTicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket for a client with a simplified schema that doesn't require client_id in the request body"""
    # Verify that the client exists
    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Get the ticket data as a dictionary and add the client_id from the path
    ticket_data = ticket.model_dump()
    ticket_data["client_id"] = client_id
    
    # Create the ticket
    new_ticket = TicketModel(**ticket_data)
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket
