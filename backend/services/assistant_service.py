import logging
from sqlalchemy.orm import Session

from repositories.assistant_repository import AssistantRepository
from models.assistant import Assistant
from core.exceptions import NotFoundException, ConflictException, ValidationException

logger = logging.getLogger(__name__)


class AssistantService:
    def __init__(self, db: Session, repo: AssistantRepository | None = None):
        self.db = db
        self.repo = repo or AssistantRepository(db)

    def create(self, data: dict) -> Assistant:
        if data.get("phone"):
            existing = self.repo.get_by_phone_number(data["phone"])
            if existing:
                raise ConflictException("Phone number already exists.")
        assistant = Assistant(**data)
        self.repo.create(assistant)
        self.db.commit()
        self.db.refresh(assistant)
        return assistant

    def get_all(self) -> list[Assistant]:
        return self.repo.get_all_assistants()

    def get_by_id(self, assistant_id: int) -> Assistant:
        assistant = self.repo.get_by_id(assistant_id)
        if not assistant:
            raise NotFoundException(f"Assistant with id {assistant_id} not found")
        return assistant

    def update(self, assistant_id: int, update_data: dict) -> Assistant:
        assistant = self.get_by_id(assistant_id)
        if not update_data:
            raise ValidationException("Please enter some assistant's information.")
        if update_data.get("phone"):
            existing = self.repo.get_by_phone_number(update_data["phone"])
            if existing and existing.id != assistant_id:
                raise ConflictException("Phone number already exists.")
        for field, value in update_data.items():
            setattr(assistant, field, value)
        self.db.commit()
        self.db.refresh(assistant)
        return assistant

    def delete(self, assistant_id: int) -> Assistant:
        assistant = self.get_by_id(assistant_id)
        result = Assistant(
            id=assistant.id, firstname=assistant.firstname, lastname=assistant.lastname,
        )
        self.repo.delete(assistant)
        self.db.commit()
        return result
