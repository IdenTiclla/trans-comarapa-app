from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.user import User
from models.client import Client
from models.secretary import Secretary
from models.administrator import Administrator
from models.driver import Driver
from models.assistant import Assistant
from repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def search_users(
        self,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> tuple[list[User], int]:
        query = self.db.query(User)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.username.ilike(search_term),
                    User.email.ilike(search_term),
                    User.firstname.ilike(search_term),
                    User.lastname.ilike(search_term),
                )
            )
        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    def username_exists(self, username: str, exclude_id: Optional[int] = None) -> bool:
        query = self.db.query(User).filter(User.username == username)
        if exclude_id:
            query = query.filter(User.id != exclude_id)
        return query.first() is not None

    def email_exists(self, email: str, exclude_id: Optional[int] = None) -> bool:
        query = self.db.query(User).filter(User.email == email)
        if exclude_id:
            query = query.filter(User.id != exclude_id)
        return query.first() is not None

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def delete_user(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()

    def get_administrator_by_user_id(self, user_id: int) -> Optional[Administrator]:
        return self.db.query(Administrator).filter(Administrator.user_id == user_id).first()

    def get_secretary_by_user_id(self, user_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.user_id == user_id).first()

    def get_driver_by_user_id(self, user_id: int) -> Optional[Driver]:
        return self.db.query(Driver).filter(Driver.user_id == user_id).first()

    def get_assistant_by_user_id(self, user_id: int) -> Optional[Assistant]:
        return self.db.query(Assistant).filter(Assistant.user_id == user_id).first()

    def get_client_by_user_id(self, user_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.user_id == user_id).first()

    def get_role_entity_by_user_id(self, user_id: int, model):
        return self.db.query(model).filter(model.user_id == user_id).first()


class ClientRepository(BaseRepository[Client]):

    def __init__(self, db: Session):
        super().__init__(Client, db)

    def get_client_by_id(self, client_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def search_clients(self, search_term: str) -> list[Client]:
        term = f"%{search_term}%"
        return (
            self.db.query(Client)
            .filter(
                or_(
                    Client.firstname.ilike(term),
                    Client.lastname.ilike(term),
                    Client.document_id.ilike(term),
                    Client.phone.ilike(term),
                )
            )
            .all()
        )
