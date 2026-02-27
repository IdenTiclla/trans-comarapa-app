"""
Ticket routes - thin HTTP adapter that delegates to TicketService.

All business logic lives in services/ticket_service.py.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from schemas.ticket import TicketCreate, Ticket as TicketSchema, TicketUpdate
from services.ticket_service import TicketService

router = APIRouter(tags=["Tickets"])


def get_service(db: Session = Depends(get_db)) -> TicketService:
    return TicketService(db)


@router.get("", response_model=List[TicketSchema])
async def get_all_tickets(service: TicketService = Depends(get_service)):
    """Get all tickets."""
    return service.get_all()


@router.get("/client/{client_id}", response_model=List[TicketSchema])
async def get_tickets_by_client(client_id: int, service: TicketService = Depends(get_service)):
    """Get tickets by client ID."""
    return service.get_by_client(client_id)


@router.get("/seat/{seat_id}", response_model=List[TicketSchema])
async def get_tickets_by_seat(seat_id: int, service: TicketService = Depends(get_service)):
    """Get tickets by seat ID."""
    return service.get_by_seat(seat_id)


@router.get("/trip/{trip_id}", response_model=List[TicketSchema])
async def get_tickets_by_trip(trip_id: int, service: TicketService = Depends(get_service)):
    """Get tickets by trip ID."""
    return service.get_by_trip(trip_id)


@router.get("/{ticket_id}", response_model=TicketSchema)
async def get_ticket(ticket_id: int, service: TicketService = Depends(get_service)):
    """Get a ticket by ID."""
    return service.get_by_id(ticket_id)


@router.post("", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket: TicketCreate, service: TicketService = Depends(get_service)):
    """Create a new ticket."""
    return service.create_ticket(ticket)


@router.put("/{ticket_id}", response_model=TicketSchema)
async def update_ticket(
    ticket_id: int, ticket_update: TicketUpdate, service: TicketService = Depends(get_service)
):
    """Update a ticket."""
    return service.update_ticket(ticket_id, ticket_update)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: int, service: TicketService = Depends(get_service)):
    """Delete a ticket."""
    service.delete_ticket(ticket_id)


@router.put("/{ticket_id}/cancel", response_model=TicketSchema)
async def cancel_ticket(ticket_id: int, service: TicketService = Depends(get_service)):
    """Cancel a ticket."""
    return service.cancel_ticket(ticket_id)


@router.put("/{ticket_id}/change-seat/{new_seat_id}", response_model=TicketSchema)
async def change_ticket_seat(
    ticket_id: int, new_seat_id: int, service: TicketService = Depends(get_service)
):
    """Change the seat assignment for a ticket."""
    return service.change_seat(ticket_id, new_seat_id)
