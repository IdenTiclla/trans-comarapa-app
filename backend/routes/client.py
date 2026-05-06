from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.client import ClientCreate, ClientUpdate, Client as ClientSchema
from schemas.ticket import Ticket as TicketSchema, TicketCreate
from services.client_service import ClientService

router = APIRouter(tags=["Clients"])


def get_service(db: Session = Depends(get_db)) -> ClientService:
    return ClientService(db)


@router.get("/search", response_model=list[ClientSchema])
def search_clients(
    q: str = Query(..., description="Search term for client name or document ID"),
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.search(q)


@router.get("", response_model=list[ClientSchema])
def get_all_clients(
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_all()


@router.get("/{client_id}", response_model=ClientSchema)
def get_client(
    client_id: int,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(client_id)


@router.post("", response_model=ClientSchema)
def create_client(
    client: ClientCreate,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create(client.model_dump())


@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    client_id: int,
    client: ClientUpdate,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(client_id, client.model_dump())


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    service.delete(client_id)


@router.get("/{client_id}/tickets", response_model=list[TicketSchema])
def get_client_tickets(
    client_id: int,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_tickets(client_id)


@router.get("/{client_id}/tickets/{ticket_id}", response_model=TicketSchema)
def get_client_ticket(
    client_id: int,
    ticket_id: int,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_ticket(client_id, ticket_id)


@router.post("/{client_id}/tickets", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_client_ticket(
    client_id: int,
    ticket: TicketCreate,
    service: ClientService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create_ticket(client_id, ticket.model_dump())
