"""
User repository with domain-specific query methods.
"""

from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.user import User
from models.client import Client
from repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Find a user by email address."""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Find a user by username."""
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
        """Search users with filters and pagination."""
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


class ClientRepository(BaseRepository[Client]):

    def __init__(self, db: Session):
        super().__init__(Client, db)

    def get_client_by_id(self, client_id: int) -> Optional[Client]:
        """Get a client by ID."""
        return self.db.query(Client).filter(Client.id == client_id).first()

    def search_clients(self, search_term: str) -> list[Client]:
        """Search clients by name, document, or phone."""
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
