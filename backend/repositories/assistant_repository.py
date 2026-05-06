import logging
from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from models.assistant import Assistant

logger = logging.getLogger(__name__)


class AssistantRepository(BaseRepository[Assistant]):
    def __init__(self, db: Session):
        super().__init__(Assistant, db)

    def get_by_phone_number(self, phone_number: str) -> Assistant | None:
        return self.db.query(Assistant).filter(Assistant.phone == phone_number).first()

    def get_all_assistants(self) -> list[Assistant]:
        return self.db.query(Assistant).all()
