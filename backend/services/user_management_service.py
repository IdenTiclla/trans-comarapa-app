import logging
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
    ForbiddenException,
)
from core.security import get_password_hash
from models.user import User, UserRole
from models.secretary import Secretary
from models.administrator import Administrator
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
from models.office import Office
from repositories.user_repository import UserRepository
from repositories.person_repository import PersonRepository

ROLE_TO_MODEL = {
    UserRole.SECRETARY: Secretary,
    UserRole.DRIVER: Driver,
    UserRole.ASSISTANT: Assistant,
    UserRole.ADMIN: Administrator,
    UserRole.CLIENT: Client,
}

logger = logging.getLogger(__name__)


class UserManagementService:

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
        return self.repo.search_users(
            skip=skip,
            limit=limit,
            search=search,
            role=role,
            is_active=is_active,
        )

    def get_by_id(self, user_id: int) -> User:
        return self.repo.get_by_id_or_raise(user_id, "User")

    def create_user(self, user_data: dict) -> User:
        existing = self.repo.get_by_email(user_data.get("email", ""))
        if existing:
            raise ConflictException("El email ya está registrado")

        existing_username = self.repo.get_by_username(user_data.get("username", ""))
        if existing_username:
            raise ConflictException("El nombre de usuario ya está registrado")

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            role=user_data.get("role", UserRole.USER),
            firstname=user_data.get("firstname", ""),
            lastname=user_data.get("lastname", ""),
            is_active=user_data.get("is_active", True),
            is_admin=user_data.get("is_admin", False),
        )
        self.repo.create_user(user)
        self.db.commit()
        self.db.refresh(user)
        logger.info("User created: %d (%s)", user.id, user.email)

        person_model = ROLE_TO_MODEL.get(user.role)
        if person_model:
            person_data = person_model(
                firstname=user.firstname,
                lastname=user.lastname,
                user_id=user.id,
            )
            person_repo = PersonRepository(self.db)
            person_repo.create_person(person_data)
            self.db.commit()
            self.db.refresh(person_data)

        return user

    def update_user(self, user_id: int, update_data: dict) -> User:
        user = self.repo.get_by_id_or_raise(user_id, "User")

        if "email" in update_data and update_data["email"] != user.email:
            existing = self.repo.get_by_email(update_data["email"])
            if existing:
                raise ConflictException("El email ya está registrado")

        if "username" in update_data and update_data["username"] != user.username:
            existing_username = self.repo.get_by_username(update_data["username"])
            if existing_username:
                raise ConflictException("El nombre de usuario ya está registrado")

        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(
                update_data.pop("password")
            )
        else:
            update_data.pop("password", None)

        for field, value in update_data.items():
            if value is not None and hasattr(user, field):
                setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int, current_user_id: int) -> None:
        if user_id == current_user_id:
            raise ForbiddenException("No puedes eliminar tu propio usuario")
        user = self.repo.get_by_id_or_raise(user_id, "User")
        self.repo.delete_user(user)
        self.db.commit()

    def activate_user(self, user_id: int) -> User:
        user = self.repo.get_by_id_or_raise(user_id, "User")
        user.is_active = True
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: int, current_user_id: int) -> User:
        if user_id == current_user_id:
            raise ForbiddenException("No puedes desactivar tu propio usuario")
        user = self.repo.get_by_id_or_raise(user_id, "User")
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user

    @staticmethod
    def get_available_roles() -> list[dict]:
        return [
            {"value": role.value, "label": role.value.replace("_", " ").title()}
            for role in UserRole
        ]

    def _get_person_entity(self, user: User):
        role_map = {
            UserRole.ADMIN: (self.repo.get_administrator_by_user_id, None),
            UserRole.SECRETARY: (self.repo.get_secretary_by_user_id, None),
            UserRole.DRIVER: (self.repo.get_driver_by_user_id, None),
            UserRole.ASSISTANT: (self.repo.get_assistant_by_user_id, None),
            UserRole.CLIENT: (self.repo.get_client_by_user_id, None),
        }
        entry = role_map.get(user.role)
        if entry:
            return entry[0](user.id)
        return None

    def get_my_profile(self, current_user: User) -> dict:
        person_entity = self._get_person_entity(current_user)

        person_data = None
        if person_entity:
            person_data = {
                "id": person_entity.id,
                "firstname": person_entity.firstname,
                "lastname": person_entity.lastname,
                "phone": person_entity.phone,
                "birth_date": person_entity.birth_date,
                "bio": getattr(person_entity, "bio", None),
                "type": current_user.role.value.lower(),
                "created_at": person_entity.created_at,
                "updated_at": person_entity.updated_at,
            }

            if current_user.role == UserRole.DRIVER:
                person_data.update(
                    {
                        "license_number": person_entity.license_number,
                        "license_type": person_entity.license_type,
                        "license_expiry": person_entity.license_expiry,
                        "status": person_entity.status,
                    }
                )
            elif current_user.role == UserRole.CLIENT:
                person_data.update(
                    {
                        "document_id": person_entity.document_id,
                        "address": person_entity.address,
                        "city": person_entity.city,
                        "state": person_entity.state,
                        "is_minor": getattr(person_entity, "is_minor", None),
                    }
                )
            elif current_user.role == UserRole.SECRETARY:
                office_data = None
                if person_entity.office_id and person_entity.office:
                    office = person_entity.office
                    office_data = {
                        "id": office.id,
                        "name": office.name,
                        "phone": office.phone,
                        "email": office.email,
                        "manager_name": office.manager_name,
                        "location": None,
                    }
                    if office.location:
                        office_data["location"] = {
                            "id": office.location.id,
                            "name": office.location.name,
                            "code": office.location.code,
                        }
                person_data.update(
                    {
                        "office_id": getattr(person_entity, "office_id", None),
                        "office": office_data,
                    }
                )

        response_data = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "is_admin": current_user.is_admin,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
            "person": person_data,
            "firstname": person_data.get("firstname")
            if person_data
            else current_user.firstname,
            "lastname": person_data.get("lastname")
            if person_data
            else current_user.lastname,
            "phone": person_data.get("phone") if person_data else None,
            "birth_date": person_data.get("birth_date") if person_data else None,
        }

        return response_data

    def update_my_profile(self, current_user: User, profile_data: dict) -> dict:
        user_updated = False
        email = profile_data.get("email")
        if email and email != current_user.email:
            existing = self.repo.get_by_email(email)
            if existing and existing.id != current_user.id:
                raise ConflictException("El email ya está en uso por otro usuario")
            current_user.email = email
            user_updated = True

        if user_updated:
            self.db.commit()
            self.db.refresh(current_user)

        person_entity = self._get_person_entity(current_user)

        if person_entity:
            person_updated = False
            for field in ["firstname", "lastname", "phone", "birth_date"]:
                if field in profile_data and profile_data[field] is not None:
                    setattr(person_entity, field, profile_data[field])
                    person_updated = True

            if (
                "bio" in profile_data
                and profile_data["bio"] is not None
                and hasattr(person_entity, "bio")
            ):
                person_entity.bio = profile_data["bio"]
                person_updated = True

            role_data = profile_data.get("role_specific_data") or {}
            if current_user.role == UserRole.DRIVER:
                for f in ["license_number", "license_type", "license_expiry", "status"]:
                    if f in role_data:
                        setattr(person_entity, f, role_data[f])
                        person_updated = True
            elif current_user.role == UserRole.CLIENT:
                for f in ["document_id", "address", "city", "state"]:
                    if f in role_data:
                        setattr(person_entity, f, role_data[f])
                        person_updated = True

            if person_updated:
                self.db.commit()
                self.db.refresh(person_entity)

        return self.get_my_profile(current_user)
