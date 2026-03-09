"""
Person service - generic logic for creating user+person pairs.

Deduplicates the identical pattern that existed in routes/secretary.py and
routes/administrator.py:
  1. Check email uniqueness
  2. Check username uniqueness
  3. Hash password + create User
  4. Create role entity
  5. Commit and return response
"""

import logging
from typing import Any, Type

from sqlalchemy.orm import Session

from core.exceptions import ConflictException
from models.user import User as UserModel

logger = logging.getLogger(__name__)


class PersonService:
    """Generic business logic for creating persons (secretary, administrator, etc.)."""

    def __init__(self, db: Session):
        self.db = db

    def create_person_with_user(
        self,
        *,
        person_data: dict,
        user_data: dict,
        role: str,
        PersonModel: Type[Any],
    ) -> tuple[Any, UserModel]:
        """
        Generic method that:
        1. Checks email/username uniqueness.
        2. Creates a User with hashed password and given role.
        3. Creates a PersonModel entity linked to the user.
        4. Commits atomically and returns (person_instance, user_instance).

        Args:
            person_data: Fields for the PersonModel (excluding user_id).
            user_data:   Dict must contain: username, email, password, is_active, is_admin.
            role:        Role string to assign to the User (e.g. "secretary", "admin").
            PersonModel: The ORM model class for the person entity.
        """
        # 1. Verify email uniqueness
        if self.db.query(UserModel).filter(UserModel.email == user_data["email"]).first():
            raise ConflictException("Email already registered")

        # 2. Verify username uniqueness
        if self.db.query(UserModel).filter(UserModel.username == user_data["username"]).first():
            raise ConflictException("Username already registered")

        # 3. Create user
        hashed_password = UserModel.get_password_hash(user_data["password"])
        db_user = UserModel(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            role=role,
            is_active=user_data.get("is_active", True),
            is_admin=user_data.get("is_admin", False),
        )
        self.db.add(db_user)
        self.db.flush()

        # 4. Create person entity
        db_person = PersonModel(**person_data, user_id=db_user.id)
        self.db.add(db_person)
        self.db.flush()

        # 5. Commit
        self.db.commit()
        self.db.refresh(db_person)
        self.db.refresh(db_user)

        logger.info(
            "Created %s (id=%d) with user id=%d",
            PersonModel.__name__,
            db_person.id,
            db_user.id,
        )
        return db_person, db_user
