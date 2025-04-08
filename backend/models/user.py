from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from db.base import Base
from passlib.context import CryptContext

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

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
