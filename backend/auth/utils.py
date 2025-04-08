from sqlalchemy.orm import Session
from models.user import User
from schemas.auth import UserCreate
import secrets
import hashlib
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración para tokens de restablecimiento de contraseña
RESET_TOKEN_EXPIRE_HOURS = 24
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica a un usuario por email y contraseña.

    Args:
        db: Sesión de base de datos
        email: Email del usuario
        password: Contraseña del usuario

    Returns:
        Usuario si la autenticación es exitosa, False en caso contrario
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not User.verify_password(password, user.hashed_password):
        return False
    return user

def create_user(db: Session, user: UserCreate):
    """
    Crea un nuevo usuario en la base de datos.

    Args:
        db: Sesión de base de datos
        user: Datos del usuario a crear

    Returns:
        Usuario creado
    """
    hashed_password = User.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def generate_password_reset_token(email: str) -> str:
    """
    Genera un token para restablecimiento de contraseña.
    
    Args:
        email: Email del usuario
    
    Returns:
        Token para restablecimiento de contraseña
    """
    expire = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password_reset_token(token: str) -> str:
    """
    Verifica un token de restablecimiento de contraseña.
    
    Args:
        token: Token de restablecimiento
    
    Returns:
        Email del usuario si el token es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        # Verificar que el token sea del tipo correcto
        if token_type != "password_reset":
            return None
            
        return email
    except:
        return None

def reset_user_password(db: Session, email: str, new_password: str) -> bool:
    """
    Restablece la contraseña de un usuario.
    
    Args:
        db: Sesión de base de datos
        email: Email del usuario
        new_password: Nueva contraseña
    
    Returns:
        True si se restableció correctamente, False en caso contrario
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
        
    user.hashed_password = User.get_password_hash(new_password)
    db.commit()
    return True
