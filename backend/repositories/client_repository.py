import logging
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.client import Client
from models.user import User
from models.ticket import Ticket

logger = logging.getLogger(__name__)


class ClientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, client_id: int) -> Client | None:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_by_id_or_raise(self, client_id: int) -> Client:
        client = self.get_by_id(client_id)
        if not client:
            from core.exceptions import NotFoundException
            raise NotFoundException(f"Client with id {client_id} not found")
        return client

    def get_all(self) -> list[Client]:
        return self.db.query(Client).all()

    def search(self, search_term: str, limit: int = 10) -> list[Client]:
        term = search_term.strip().lower()
        return (
            self.db.query(Client)
            .filter(
                or_(
                    Client.firstname.ilike(f"%{term}%"),
                    Client.lastname.ilike(f"%{term}%"),
                    Client.document_id.ilike(f"%{term}%"),
                    (Client.firstname + " " + Client.lastname).ilike(f"%{term}%"),
                )
            )
            .limit(limit)
            .all()
        )

    def get_tickets(self, client_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.client_id == client_id).all()

    def get_ticket(self, client_id: int, ticket_id: int) -> Ticket | None:
        return (
            self.db.query(Ticket)
            .filter(Ticket.client_id == client_id, Ticket.id == ticket_id)
            .first()
        )

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def create(self, client: Client) -> Client:
        self.db.add(client)
        self.db.flush()
        return client

    def update(self, client_id: int, update_data: dict) -> None:
        self.db.query(Client).filter(Client.id == client_id).update(update_data)

    def delete(self, client_id: int) -> None:
        self.db.query(Client).filter(Client.id == client_id).delete()
