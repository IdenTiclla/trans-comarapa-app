import logging
from typing import Any, Type

from sqlalchemy.orm import Session

from core.exceptions import ConflictException
from core.security import get_password_hash
from models.user import User as UserModel
from repositories.user_repository import UserRepository
from repositories.person_repository import PersonRepository

logger = logging.getLogger(__name__)


class PersonService:

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.person_repo = PersonRepository(db)

    def create_person_with_user(
        self,
        *,
        person_data: dict,
        user_data: dict,
        role: str,
        PersonModel: Type[Any],
    ) -> tuple[Any, UserModel]:
        if self.user_repo.get_by_email(user_data["email"]):
            raise ConflictException("Email already registered")

        if self.user_repo.get_by_username(user_data["username"]):
            raise ConflictException("Username already registered")

        hashed_password = get_password_hash(user_data["password"])
        db_user = UserModel(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            role=role,
            is_active=user_data.get("is_active", True),
            is_admin=user_data.get("is_admin", False),
        )
        self.user_repo.create_user(db_user)

        db_person = PersonModel(**person_data, user_id=db_user.id)
        self.person_repo.create_person(db_person)

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
