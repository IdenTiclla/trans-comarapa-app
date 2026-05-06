import logging
from sqlalchemy.orm import Session

from repositories.administrator_repository import AdministratorRepository
from models.administrator import Administrator
from core.exceptions import NotFoundException

logger = logging.getLogger(__name__)


class AdministratorService:
    def __init__(self, db: Session, repo: AdministratorRepository | None = None):
        self.db = db
        self.repo = repo or AdministratorRepository(db)

    def get_all(self) -> list[Administrator]:
        return self.repo.get_all()

    def get_by_id(self, admin_id: int) -> Administrator:
        admin = self.repo.get_by_id(admin_id)
        if not admin:
            raise NotFoundException(f"Administrator with ID {admin_id} not found")
        return admin
