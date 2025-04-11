from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base import Base
from passlib.context import CryptContext
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    SECRETARY = "secretary"
    DRIVER = "driver"
    ASSISTANT = "assistant"
    CLIENT = "client"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relaciones uno a uno con los diferentes tipos de personas
    secretary = relationship("Secretary", uselist=False, back_populates="user")
    driver = relationship("Driver", uselist=False, back_populates="user")
    assistant = relationship("Assistant", uselist=False, back_populates="user")
    administrator = relationship("Administrator", uselist=False, back_populates="user")
    client = relationship("Client", uselist=False, back_populates="user")

    # Definir el contexto de contraseña una sola vez para evitar problemas con bcrypt
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    @staticmethod
    def verify_password(plain_password, hashed_password):
        try:
            return User._pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            print(f"Error verificando contraseña: {e}")
            return False

    @staticmethod
    def get_password_hash(password):
        try:
            return User._pwd_context.hash(password)
        except Exception as e:
            print(f"Error generando hash de contraseña: {e}")
            raise
