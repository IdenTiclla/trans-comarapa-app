import logging
from sqlalchemy.orm import Session

from models.secretary import Secretary
from models.trip import Trip
from models.ticket import Ticket
from models.package import Package

logger = logging.getLogger(__name__)


class SecretaryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, secretary_id: int) -> Secretary | None:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()

    def get_by_id_or_raise(self, secretary_id: int) -> Secretary:
        secretary = self.get_by_id(secretary_id)
        if not secretary:
            from core.exceptions import NotFoundException
            raise NotFoundException(f"Secretary with id {secretary_id} not found")
        return secretary

    def get_by_user_id(self, user_id: int) -> Secretary | None:
        return self.db.query(Secretary).filter(Secretary.user_id == user_id).first()

    def get_all(self) -> list[Secretary]:
        return self.db.query(Secretary).all()

    def get_trips(self, secretary_id: int) -> list[Trip]:
        return self.db.query(Trip).filter(Trip.secretary_id == secretary_id).all()

    def get_tickets(self, secretary_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.secretary_id == secretary_id).all()

    def get_packages(self, secretary_id: int) -> list[Package]:
        return self.db.query(Package).filter(Package.secretary_id == secretary_id).all()

    def update(self, secretary: Secretary, update_data: dict) -> Secretary:
        allowed_fields = {"firstname", "lastname", "phone", "office_id"}
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(secretary, field):
                setattr(secretary, field, value)
        self.db.flush()
        return secretary

    def delete(self, secretary: Secretary) -> None:
        self.db.delete(secretary)
        self.db.flush()
