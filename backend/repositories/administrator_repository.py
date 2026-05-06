import logging
from sqlalchemy.orm import Session

from models.administrator import Administrator

logger = logging.getLogger(__name__)


class AdministratorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, admin_id: int) -> Administrator | None:
        return self.db.query(Administrator).filter(Administrator.id == admin_id).first()

    def get_all(self) -> list[Administrator]:
        return self.db.query(Administrator).all()
