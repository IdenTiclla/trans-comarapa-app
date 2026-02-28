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
from models.secretary import Secretary
from models.administrator import Administrator
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
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
            raise ConflictException("El email ya está registrado")

        # Check username uniqueness
        existing_username = self.db.query(User).filter(User.username == user_data.get("username", "")).first()
        if existing_username:
            raise ConflictException("El nombre de usuario ya está registrado")

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
        
        # If the new user is a secretary, create an associated secretary record
        if user.role == UserRole.SECRETARY:
            secretary_data = Secretary(
                firstname=user.firstname,
                lastname=user.lastname,
                user_id=user.id,
            )
            self.db.add(secretary_data)
            self.db.commit()
            self.db.refresh(secretary_data)
            
        return user

    def update_user(self, user_id: int, update_data: dict) -> User:
        """Update a user."""
        user = self.repo.get_by_id_or_raise(user_id, "User")

        # If email is changing, check uniqueness
        if "email" in update_data and update_data["email"] != user.email:
            existing = self.repo.get_by_email(update_data["email"])
            if existing:
                raise ConflictException("El email ya está registrado")

        # If username is changing, check uniqueness
        if "username" in update_data and update_data["username"] != user.username:
            existing_username = self.db.query(User).filter(User.username == update_data["username"]).first()
            if existing_username:
                raise ConflictException("El nombre de usuario ya está registrado")

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

    def delete_user(self, user_id: int, current_user_id: int) -> None:
        """Delete a user."""
        if user_id == current_user_id:
            raise ForbiddenException("No puedes eliminar tu propio usuario")
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

    def deactivate_user(self, user_id: int, current_user_id: int) -> User:
        """Deactivate a user."""
        if user_id == current_user_id:
            raise ForbiddenException("No puedes desactivar tu propio usuario")
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

    def get_my_profile(self, current_user: User) -> dict:
        """Get complete profile of authenticated user."""
        person_data = None
        person_entity = None
        
        if current_user.role == UserRole.ADMIN:
            person_entity = self.db.query(Administrator).filter(Administrator.user_id == current_user.id).first()
        elif current_user.role == UserRole.SECRETARY:
            person_entity = self.db.query(Secretary).filter(Secretary.user_id == current_user.id).first()
        elif current_user.role == UserRole.DRIVER:
            person_entity = self.db.query(Driver).filter(Driver.user_id == current_user.id).first()
        elif current_user.role == UserRole.ASSISTANT:
            person_entity = self.db.query(Assistant).filter(Assistant.user_id == current_user.id).first()
        elif current_user.role == UserRole.CLIENT:
            person_entity = self.db.query(Client).filter(Client.user_id == current_user.id).first()
        
        if person_entity:
            person_data = {
                "id": person_entity.id,
                "firstname": person_entity.firstname,
                "lastname": person_entity.lastname,
                "phone": person_entity.phone,
                "birth_date": person_entity.birth_date,
                "bio": getattr(person_entity, 'bio', None),
                "type": current_user.role.value.lower(),
                "created_at": person_entity.created_at,
                "updated_at": person_entity.updated_at
            }
            
            if current_user.role == UserRole.DRIVER:
                person_data.update({
                    "license_number": person_entity.license_number,
                    "license_type": person_entity.license_type,
                    "license_expiry": person_entity.license_expiry,
                    "status": person_entity.status
                })
            elif current_user.role == UserRole.CLIENT:
                person_data.update({
                    "document_id": person_entity.document_id,
                    "address": person_entity.address,
                    "city": person_entity.city,
                    "state": person_entity.state,
                    "is_minor": getattr(person_entity, 'is_minor', None)
                })
            elif current_user.role == UserRole.SECRETARY:
                person_data.update({
                    "office_id": getattr(person_entity, 'office_id', None)
                })
        
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
            "firstname": person_data.get("firstname") if person_data else current_user.firstname,
            "lastname": person_data.get("lastname") if person_data else current_user.lastname,
            "phone": person_data.get("phone") if person_data else None,
            "birth_date": person_data.get("birth_date") if person_data else None
        }
        
        return response_data

    def update_my_profile(self, current_user: User, profile_data: dict) -> dict:
        """Update authenticated user's profile."""
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
            
        person_entity = None
        if current_user.role == UserRole.ADMIN:
            person_entity = self.db.query(Administrator).filter(Administrator.user_id == current_user.id).first()
        elif current_user.role == UserRole.SECRETARY:
            person_entity = self.db.query(Secretary).filter(Secretary.user_id == current_user.id).first()
        elif current_user.role == UserRole.DRIVER:
            person_entity = self.db.query(Driver).filter(Driver.user_id == current_user.id).first()
        elif current_user.role == UserRole.ASSISTANT:
            person_entity = self.db.query(Assistant).filter(Assistant.user_id == current_user.id).first()
        elif current_user.role == UserRole.CLIENT:
            person_entity = self.db.query(Client).filter(Client.user_id == current_user.id).first()
            
        if person_entity:
            person_updated = False
            for field in ["firstname", "lastname", "phone", "birth_date"]:
                if field in profile_data and profile_data[field] is not None:
                    setattr(person_entity, field, profile_data[field])
                    person_updated = True
            
            if "bio" in profile_data and profile_data["bio"] is not None and hasattr(person_entity, "bio"):
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
