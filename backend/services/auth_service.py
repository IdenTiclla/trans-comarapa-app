"""
Auth service - contains authentication business logic.

Extracted from routes/auth.py. Handles login, logout, token refresh,
and user registration logic.
"""

import logging
from datetime import timedelta
from typing import Optional, Tuple

from sqlalchemy.orm import Session

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

logger = logging.getLogger(__name__)


class AuthService:
    """Business logic for authentication and authorization."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate a user by email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise UnauthorizedException("Incorrect email or password")
        if not user.verify_password(password):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("User account is disabled")
        return user

    def get_user_role_info(self, user: User) -> dict:
        """Get role-specific information for a user (secretary_id, driver_id, etc.)."""
        role_info = {}

        if user.role == UserRole.SECRETARY:
            secretary = self.db.query(Secretary).filter(Secretary.user_id == user.id).first()
            if secretary:
                role_info["secretary_id"] = secretary.id

        elif user.role == UserRole.DRIVER:
            driver = self.db.query(Driver).filter(Driver.user_id == user.id).first()
            if driver:
                role_info["driver_id"] = driver.id

        elif user.role == UserRole.ASSISTANT:
            assistant = self.db.query(Assistant).filter(Assistant.user_id == user.id).first()
            if assistant:
                role_info["assistant_id"] = assistant.id

        elif user.role == UserRole.CLIENT:
            client = self.db.query(Client).filter(Client.user_id == user.id).first()
            if client:
                role_info["client_id"] = client.id

        elif user.role == UserRole.ADMIN:
            admin = self.db.query(Administrator).filter(Administrator.user_id == user.id).first()
            if admin:
                role_info["administrator_id"] = admin.id

        return role_info

    def register_user(self, user_data: dict) -> User:
        """Register a new user."""
        # Check if email already exists
        existing = self.db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            raise ConflictException(f"User with email {user_data['email']} already exists")

        # Check if username already exists
        existing_username = self.db.query(User).filter(User.username == user_data.get("username")).first()
        if existing_username:
            raise ConflictException(f"User with username {user_data.get('username')} already exists")

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

    def get_user_person_info(self, user: User) -> Optional[dict]:
        """Get the person record associated with a user regardless of role."""
        role_models = {
            UserRole.SECRETARY: Secretary,
            UserRole.DRIVER: Driver,
            UserRole.ASSISTANT: Assistant,
            UserRole.CLIENT: Client,
            UserRole.ADMIN: Administrator,
        }
        model = role_models.get(user.role)
        if model:
            return self.db.query(model).filter(model.user_id == user.id).first()
        return None
