"""
Auth service - contains authentication business logic.

Extracted from routes/auth.py. Handles login, logout, token refresh,
and user registration logic.
"""

import logging
from datetime import timedelta
from typing import Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import func

from core.exceptions import (
    NotFoundException,
    UnauthorizedException,
    ConflictException,
    ValidationException,
)
from models.user import User, UserRole
from models.secretary import Secretary
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
from models.administrator import Administrator
from auth.jwt import ACCESS_TOKEN_EXPIRE_MINUTES

logger = logging.getLogger(__name__)


class AuthService:
    """Business logic for authentication and authorization."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate a user by email and password."""
        # The test expects strict case sensitivity. If the DB is case-insensitive (like SQLite by default),
        # we need to enforce the check in Python.
        user = self.db.query(User).filter(User.email == email).first()
        if not user or user.email != email or not User.verify_password(password, getattr(user, "hashed_password", "")) or not user.is_active:
            raise UnauthorizedException("Incorrect email or password")
        return user

    def get_user_role_info(self, user: User) -> dict:
        """Get role-specific information for a user (secretary_id, driver_id, etc.)."""
        role_info = {}
        role_map = {
            UserRole.SECRETARY: ("secretary_id", Secretary),
            UserRole.DRIVER: ("driver_id", Driver),
            UserRole.ASSISTANT: ("assistant_id", Assistant),
            UserRole.CLIENT: ("client_id", Client),
            UserRole.ADMIN: ("administrator_id", Administrator)
        }
        
        if user.role in role_map:
            id_key, model = role_map[user.role]
            entity = self.db.query(model).filter(model.user_id == user.id).first()
            if entity:
                role_info[id_key] = entity.id

        return role_info

    def register_user(self, user_data: dict) -> User:
        """Register a new user."""
        if self.db.query(User).filter(User.email == user_data["email"]).first():
            raise ConflictException(f"User with email {user_data['email']} already exists")

        # Check username uniqueness if provided
        username = user_data.get("username")
        if username and self.db.query(User).filter(User.username == username).first():
            raise ConflictException(f"User with username {username} already exists")

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=User.get_password_hash(user_data["password"]),
            role=user_data.get("role", UserRole.USER),
            firstname=user_data.get("firstname", ""),
            lastname=user_data.get("lastname", ""),
            is_active=True,
            is_admin=False,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_person_info(self, user: User):
        """Get the person record associated with a user regardless of role."""
        role_models = {
            UserRole.SECRETARY: Secretary,
            UserRole.DRIVER: Driver,
            UserRole.ASSISTANT: Assistant,
            UserRole.CLIENT: Client,
            UserRole.ADMIN: Administrator,
        }
        # In python Enum values or string values might be used depending on implementation.
        role_val = user.role
        model = role_models.get(role_val)
        if not model:
            role_models_str = {k.value if hasattr(k, "value") else str(k): v for k, v in role_models.items()}
            role_val_str = role_val.value if hasattr(role_val, "value") else str(role_val)
            model = role_models_str.get(role_val_str)
            
        if model:
            return self.db.query(model).filter(model.user_id == user.id).first()
        return None

    def build_token_data(self, user: User, is_refresh: bool = False) -> dict:
        """Extract the repeated JWT payload construction."""
        effective_firstname = user.effective_firstname or ""
        effective_lastname = user.effective_lastname or ""
        
        data = {
            "sub": user.email,
            "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
            "firstname": effective_firstname,
            "lastname": effective_lastname
        }
        
        if is_refresh:
            data["token_type"] = "refresh"
        else:
            data["is_admin"] = user.is_admin
            data["is_active"] = user.is_active
            
        return data

    def build_response_body(self, user: User, access_token: str, refresh_token: str) -> dict:
        """Extract response dict + legacy role entity lookup."""
        effective_firstname = user.effective_firstname or ""
        effective_lastname = user.effective_lastname or ""
        
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "refresh_token": refresh_token,
            "refresh_token_expires_in": 7 * 24 * 60 * 60,
            "role": user.role,
            "user_id": user.id,
            "firstname": effective_firstname,
            "lastname": effective_lastname
        }
        
        if getattr(user, 'person', None):
            response_data["person"] = {
                "id": user.person.id,
                "type": user.person.type,
                "phone": user.person.phone,
                "birth_date": getattr(user.person, 'birth_date').isoformat() if getattr(getattr(user.person, 'birth_date', None), 'isoformat', None) else getattr(user.person, 'birth_date', None),
                "avatar_url": getattr(user.person, 'avatar_url', None),
                "bio": getattr(user.person, 'bio', None)
            }
            
        if not getattr(user, 'person', None):
            entity = self.get_user_person_info(user)
            if entity and hasattr(entity, 'firstname'):
                response_data["firstname"] = entity.firstname or response_data["firstname"]
                response_data["lastname"] = entity.lastname or response_data["lastname"]

        return response_data

    def update_user_profile(self, user: User, update_data: dict) -> User:
        """Update user basic details (PUT /me)"""
        # email change
        if "email" in update_data and update_data["email"] != user.email:
            existing = self.db.query(User).filter(User.email == update_data["email"]).first()
            if existing:
                raise ConflictException("Email already registered")
            user.email = update_data["email"]

        if "username" in update_data:
            user.username = update_data["username"]
                
        if update_data.get("password"):
            user.hashed_password = User.get_password_hash(update_data["password"])
            
        self.db.commit()
        self.db.refresh(user)
        return user
