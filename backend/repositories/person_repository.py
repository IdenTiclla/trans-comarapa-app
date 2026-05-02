from typing import Optional, Type, Any

from sqlalchemy.orm import Session

from models.person import Person
from models.secretary import Secretary
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
from models.administrator import Administrator
from models.user import User
from repositories.base import BaseRepository


class PersonRepository(BaseRepository[Person]):
    def __init__(self, db: Session):
        super().__init__(Person, db)

    def get_by_user_id(self, user_id: int) -> Optional[Person]:
        return self.db.query(Person).filter(Person.user_id == user_id).first()

    def get_role_entity_by_user_id(self, model: Type[Any], user_id: int) -> Optional[Any]:
        return self.db.query(model).filter(model.user_id == user_id).first()

    def get_secretary_by_user_id(self, user_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.user_id == user_id).first()

    def get_driver_by_id(self, driver_id: int) -> Optional[Driver]:
        return self.db.query(Driver).filter(Driver.id == driver_id).first()

    def get_assistant_by_id(self, assistant_id: int) -> Optional[Assistant]:
        return self.db.query(Assistant).filter(Assistant.id == assistant_id).first()

    def get_secretary_by_id(self, secretary_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()

    def get_client_by_id(self, client_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_any_secretary(self) -> Optional[Secretary]:
        return self.db.query(Secretary).first()

    def create_person(self, person) -> Any:
        self.db.add(person)
        self.db.flush()
        return person

    def create_user_with_person(
        self,
        user: User,
        person,
    ) -> tuple:
        self.db.add(user)
        self.db.flush()
        person.user_id = user.id
        self.db.add(person)
        self.db.flush()
        return person, user
