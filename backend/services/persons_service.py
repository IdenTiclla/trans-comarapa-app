import logging
from typing import Optional

from sqlalchemy.orm import Session

from repositories.person_repository import PersonRepository
from models.person import Person
from models.driver import Driver
from models.client import Client
from models.secretary import Secretary
from models.assistant import Assistant
from models.administrator import Administrator
from models.user import User
from schemas.person import PersonType
from core.exceptions import NotFoundException, ForbiddenException, ValidationException

logger = logging.getLogger(__name__)

_PERSON_MODEL_MAP = {
    PersonType.DRIVER: Driver,
    PersonType.CLIENT: Client,
    PersonType.SECRETARY: Secretary,
    PersonType.ASSISTANT: Assistant,
    PersonType.ADMINISTRATOR: Administrator,
}


class PersonsService:
    def __init__(self, db: Session, repo: PersonRepository | None = None):
        self.db = db
        self.repo = repo or PersonRepository(db)

    def get_by_id(self, person_id: int, current_user: User) -> Person:
        person = self.repo.get_by_id(person_id)
        if not person:
            raise NotFoundException("Persona no encontrada")
        if not current_user.is_admin and person.user_id != current_user.id:
            raise ForbiddenException("No tienes permisos para ver esta persona")
        return person

    def get_by_user_id(self, user_id: int, current_user: User) -> Person:
        person = self.repo.get_by_user_id(user_id)
        if not person:
            raise NotFoundException("No se encontró persona asociada a este usuario")
        if not current_user.is_admin and user_id != current_user.id:
            raise ForbiddenException("No tienes permisos para ver esta persona")
        return person

    def update(self, person_id: int, update_data: dict, current_user: User) -> Person:
        person = self.repo.get_by_id(person_id)
        if not person:
            raise NotFoundException("Persona no encontrada")
        if not current_user.is_admin and person.user_id != current_user.id:
            raise ForbiddenException("No tienes permisos para actualizar esta persona")
        for field, value in update_data.items():
            setattr(person, field, value)
        self.db.commit()
        self.db.refresh(person)
        return person

    def list_persons(
        self,
        skip: int = 0,
        limit: int = 100,
        person_type: Optional[PersonType] = None,
        search: Optional[str] = None,
    ) -> list[Person]:
        query = self.db.query(Person)
        if person_type:
            query = query.filter(Person.type == person_type.value)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                self.db.func.concat(Person.firstname, " ", Person.lastname).ilike(search_pattern)
            )
        return query.offset(skip).limit(limit).all()

    def create(self, person_data: dict) -> Person:
        user_id = person_data.get("user_id")
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("Usuario no encontrado")
        existing = self.repo.get_by_user_id(user_id)
        if existing:
            raise ValidationException("Ya existe una persona asociada a este usuario")

        person_dict = dict(person_data)
        person_type = person_dict.pop("type", None)
        model_class = _PERSON_MODEL_MAP.get(person_type, Person)
        person = model_class(**person_dict)
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        return person

    def list_drivers(self, skip: int = 0, limit: int = 100, status_filter: Optional[str] = None) -> list[Driver]:
        query = self.db.query(Driver)
        if status_filter:
            query = query.filter(Driver.status == status_filter)
        return query.offset(skip).limit(limit).all()

    def list_clients(self, skip: int = 0, limit: int = 100, city: Optional[str] = None) -> list[Client]:
        query = self.db.query(Client)
        if city:
            query = query.filter(Client.city.ilike(f"%{city}%"))
        return query.offset(skip).limit(limit).all()

    def list_secretaries(self, skip: int = 0, limit: int = 100, office_id: Optional[int] = None) -> list[Secretary]:
        query = self.db.query(Secretary)
        if office_id:
            query = query.filter(Secretary.office_id == office_id)
        return query.offset(skip).limit(limit).all()

    def update_driver(self, driver_id: int, update_data: dict, current_user: User) -> Driver:
        driver = self.db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise NotFoundException("Conductor no encontrado")
        if not current_user.is_admin and driver.user_id != current_user.id:
            raise ForbiddenException("No tienes permisos para actualizar este conductor")
        for field, value in update_data.items():
            setattr(driver, field, value)
        self.db.commit()
        self.db.refresh(driver)
        return driver

    def update_client(self, client_id: int, update_data: dict, current_user: User) -> Client:
        client = self.db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise NotFoundException("Cliente no encontrado")
        if not current_user.is_admin and client.user_id != current_user.id:
            raise ForbiddenException("No tienes permisos para actualizar este cliente")
        for field, value in update_data.items():
            setattr(client, field, value)
        self.db.commit()
        self.db.refresh(client)
        return client

    def delete(self, person_id: int) -> None:
        person = self.repo.get_by_id(person_id)
        if not person:
            raise NotFoundException("Persona no encontrada")
        self.db.delete(person)
        self.db.commit()

    def get_stats(self) -> dict:
        stats = {}
        for person_type in PersonType:
            count = self.db.query(Person).filter(Person.type == person_type.value).count()
            stats[person_type.value] = count
        stats["total"] = self.db.query(Person).count()
        return stats
