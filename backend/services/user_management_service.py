"""
User management service - contains user CRUD business logic.

Extracted from routes/user_management.py.
"""

import logging
from typing import Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import or_

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
    ForbiddenException,
)
from models.user import User, UserRole
from repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


class UserManagementService:
    """Business logic for user management operations."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def get_users(
        self,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[list[User], int]:
        """Get filtered/paginated user list."""
        return self.repo.search_users(
            skip=skip,
            limit=limit,
            search=search,
            role=role,
            is_active=is_active,
        )

    def get_by_id(self, user_id: int) -> User:
        """Get a user by ID."""
        return self.repo.get_by_id_or_raise(user_id, "User")

    def create_user(self, user_data: dict) -> User:
        """Create a new user with validation."""
        # Check email uniqueness
        existing = self.repo.get_by_email(user_data.get("email", ""))
        if existing:
            raise ConflictException(f"User with email {user_data['email']} already exists")

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=User.get_password_hash(user_data["password"]),
            role=user_data.get("role", UserRole.USER),
            firstname=user_data.get("firstname", ""),
            lastname=user_data.get("lastname", ""),
            is_active=user_data.get("is_active", True),
            is_admin=user_data.get("is_admin", False),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        logger.info("User created: %d (%s)", user.id, user.email)
        return user

    def update_user(self, user_id: int, update_data: dict) -> User:
        """Update a user."""
        user = self.repo.get_by_id_or_raise(user_id, "User")

        # If email is changing, check uniqueness
        if "email" in update_data and update_data["email"] != user.email:
            existing = self.repo.get_by_email(update_data["email"])
            if existing:
                raise ConflictException(f"User with email {update_data['email']} already exists")

        # Handle password hashing
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = User.get_password_hash(update_data.pop("password"))
        else:
            update_data.pop("password", None)

        for field, value in update_data.items():
            if value is not None and hasattr(user, field):
                setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> None:
        """Delete a user."""
        user = self.repo.get_by_id_or_raise(user_id, "User")
        self.db.delete(user)
        self.db.commit()

    def activate_user(self, user_id: int) -> User:
        """Activate a user."""
        user = self.repo.get_by_id_or_raise(user_id, "User")
        user.is_active = True
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: int) -> User:
        """Deactivate a user."""
        user = self.repo.get_by_id_or_raise(user_id, "User")
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user

    @staticmethod
    def get_available_roles() -> list[dict]:
        """Get list of available roles."""
        return [
            {"value": role.value, "label": role.value.replace("_", " ").title()}
            for role in UserRole
        ]
