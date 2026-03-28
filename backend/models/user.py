from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.base import Base
from passlib.context import CryptContext
from core.security import get_password_hash as _get_password_hash, verify_password as _verify_password
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    SECRETARY = "secretary"
    DRIVER = "driver"
    ASSISTANT = "assistant"
    CLIENT = "client"
    USER = "user"
    OWNER = "owner"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # 🔧 CAMPOS LEGACY - MANTENER por compatibilidad
    firstname = Column(String(255), nullable=True)  # DEPRECADO pero mantenido
    lastname = Column(String(255), nullable=True)   # DEPRECADO pero mantenido
    
    # Nuevos campos de seguridad
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # 🆕 NUEVA relación con Person
    person = relationship("Person", uselist=False, back_populates="user", cascade="all, delete-orphan")
    
    # Relaciones legacy (MANTENER temporalmente) - Agregamos overlaps para evitar warnings
    secretary = relationship("Secretary", uselist=False, back_populates="user", overlaps="person")
    driver = relationship("Driver", uselist=False, back_populates="user", overlaps="person")
    assistant = relationship("Assistant", uselist=False, back_populates="user", overlaps="person")
    administrator = relationship("Administrator", uselist=False, back_populates="user", overlaps="person")
    client = relationship("Client", uselist=False, back_populates="user", overlaps="person")
    owner = relationship("Owner", uselist=False, back_populates="user", overlaps="person")

    # Legacy password context — kept for reference/type compatibility
    _pwd_context = CryptContext(
        schemes=["sha256_crypt"],
        deprecated="auto",
        sha256_crypt__min_rounds=29000,
        sha256_crypt__max_rounds=200000,
        sha256_crypt__default_rounds=80000
    )

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return _verify_password(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return _get_password_hash(password)

    def set_password(self, password):
        self.hashed_password = _get_password_hash(password)

    # 🔧 PROPIEDADES DE COMPATIBILIDAD
    @property
    def effective_firstname(self):
        """Obtener firstname desde person o fallback a campo legacy"""
        return (self.person.firstname if self.person else None) or self.firstname

    @property
    def effective_lastname(self):
        """Obtener lastname desde person o fallback a campo legacy"""
        return (self.person.lastname if self.person else None) or self.lastname

    @property
    def full_name(self):
        """Nombre completo con fallback"""
        first = self.effective_firstname or ''
        last = self.effective_lastname or ''
        return f"{first} {last}".strip() or self.username
