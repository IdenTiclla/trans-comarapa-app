import logging
from sqlalchemy.orm import Session

from repositories.secretary_repository import SecretaryRepository
from models.secretary import Secretary
from models.user import User
from core.exceptions import NotFoundException, ConflictException, ValidationException

logger = logging.getLogger(__name__)


class SecretaryService:
    def __init__(self, db: Session, repo: SecretaryRepository | None = None):
        self.db = db
        self.repo = repo or SecretaryRepository(db)

    def get_all(self) -> list[Secretary]:
        return self.repo.get_all()

    def get_by_id(self, secretary_id: int) -> Secretary:
        return self.repo.get_by_id_or_raise(secretary_id)

    def get_by_user_id(self, user_id: int) -> Secretary:
        secretary = self.repo.get_by_user_id(user_id)
        if not secretary:
            raise NotFoundException(f"Secretary with user_id {user_id} not found")
        return secretary

    def update(self, secretary_id: int, data: dict) -> Secretary:
        secretary = self.repo.get_by_id_or_raise(secretary_id)
        self.repo.update(secretary, data)
        self.db.commit()
        self.db.refresh(secretary)
        return secretary

    def get_trips(self, secretary_id: int) -> list:
        self.repo.get_by_id_or_raise(secretary_id)
        return self.repo.get_trips(secretary_id)

    def get_tickets(self, secretary_id: int) -> list:
        self.repo.get_by_id_or_raise(secretary_id)
        return self.repo.get_tickets(secretary_id)

    def delete(self, secretary_id: int) -> dict:
        secretary = self.repo.get_by_id_or_raise(secretary_id)

        trips = self.repo.get_trips(secretary_id)
        if trips:
            raise ValidationException(
                f"Cannot delete secretary with id {secretary_id} because they have {len(trips)} associated trips."
            )

        tickets = self.repo.get_tickets(secretary_id)
        if tickets:
            raise ValidationException(
                f"Cannot delete secretary with id {secretary_id} because they have {len(tickets)} associated tickets."
            )

        packages = self.repo.get_packages(secretary_id)
        if packages:
            raise ValidationException(
                f"Cannot delete secretary with id {secretary_id} because they have {len(packages)} associated packages."
            )

        self.repo.delete(secretary)
        self.db.commit()
        return {"message": f"Secretary with id {secretary_id} has been successfully deleted"}

    def get_user(self, secretary_id: int) -> User:
        secretary = self.repo.get_by_id_or_raise(secretary_id)
        if not secretary.user_id:
            raise NotFoundException(f"Secretary with id {secretary_id} is not linked to any user")
        user = self.db.query(User).filter(User.id == secretary.user_id).first()
        if not user:
            raise NotFoundException(f"User with id {secretary.user_id} not found")
        return user
