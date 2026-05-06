import logging
import secrets
import string
from datetime import datetime

from sqlalchemy.orm import Session

from repositories.client_repository import ClientRepository
from models.client import Client
from models.user import User
from core.config import settings
from core.security import get_password_hash
from core.exceptions import NotFoundException, ValidationException

logger = logging.getLogger(__name__)


class ClientService:
    def __init__(self, db: Session, repo: ClientRepository | None = None):
        self.db = db
        self.repo = repo or ClientRepository(db)

    def search(self, search_term: str, limit: int = 10) -> list[Client]:
        if not search_term or len(search_term.strip()) < 2:
            raise ValidationException("Search term must be at least 2 characters long")
        return self.repo.search(search_term, limit)

    def get_all(self) -> list[Client]:
        return self.repo.get_all()

    def get_by_id(self, client_id: int) -> Client:
        return self.repo.get_by_id_or_raise(client_id)

    def create(self, client_data: dict) -> Client:
        if not client_data.get("user_id"):
            email = client_data.get("email") or f"client_{int(datetime.now().timestamp())}@{settings.EMAIL_DOMAIN}"
            existing_user = self.repo.get_user_by_email(email)
            if existing_user:
                email = f"client_{int(datetime.now().timestamp())}_{client_data.get('firstname', 'X').lower()}@{settings.EMAIL_DOMAIN}"

            base_username = f"{client_data.get('firstname', 'c')}{int(datetime.now().timestamp())}".lower().replace(" ", "")
            default_password = self._generate_random_password()

            new_user = User(
                username=base_username,
                email=email,
                role="client",
                hashed_password=get_password_hash(default_password),
                is_active=True,
                firstname=client_data.get("firstname"),
                lastname=client_data.get("lastname"),
            )
            self.repo.create_user(new_user)
            client_data["user_id"] = new_user.id
            client_data["type"] = "client"

        allowed_keys = {
            "user_id", "type", "firstname", "lastname", "phone",
            "birth_date", "document_id", "address", "city", "state", "bio",
        }
        client_model_data = {k: v for k, v in client_data.items() if k in allowed_keys}
        client = Client(**client_model_data)
        self.repo.create(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def update(self, client_id: int, client_data: dict) -> dict:
        client_data["id"] = client_id
        self.repo.update(client_id, client_data)
        self.db.commit()
        return client_data

    def delete(self, client_id: int) -> None:
        self.repo.delete(client_id)
        self.db.commit()

    def get_tickets(self, client_id: int) -> list:
        self.repo.get_by_id_or_raise(client_id)
        tickets = self.repo.get_tickets(client_id)
        if not tickets:
            raise NotFoundException("No tickets found for this client")
        return tickets

    def get_ticket(self, client_id: int, ticket_id: int):
        ticket = self.repo.get_ticket(client_id, ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        return ticket

    def create_ticket(self, client_id: int, ticket_data: dict):
        self.repo.get_by_id_or_raise(client_id)
        if ticket_data.get("client_id") != client_id:
            raise ValidationException(
                f"Client ID in path ({client_id}) does not match client ID in request body ({ticket_data.get('client_id')})"
            )
        from models.ticket import Ticket
        new_ticket = Ticket(**ticket_data)
        self.db.add(new_ticket)
        self.db.commit()
        self.db.refresh(new_ticket)
        return new_ticket

    @staticmethod
    def _generate_random_password(length: int = 10) -> str:
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))
