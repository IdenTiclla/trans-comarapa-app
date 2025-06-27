from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from schemas.auth import TokenData
from auth.blacklist import token_blacklist
import os
import uuid
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required and must not be empty")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Configuración de HTTPBearer
http_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un token JWT con los datos proporcionados y una fecha de expiración.

    Args:
        data: Datos a incluir en el token
        expires_delta: Tiempo de expiración opcional

    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregar JTI (JWT ID) único para poder revocar tokens específicos
    to_encode.update({
        "exp": expire,
        "jti": str(uuid.uuid4())  # Identificador único del token
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """
    Verifica un token JWT y devuelve los datos del token.

    Args:
        token: Token JWT a verificar
        credentials_exception: Excepción a lanzar si el token es inválido

    Returns:
        Datos del token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        jti: str = payload.get("jti")
        
        if email is None or jti is None:
            raise credentials_exception
        
        # Verificar si el token está en la lista negra usando JTI
        if token_blacklist.is_token_blacklisted(jti):
            raise credentials_exception
        
        role: str = payload.get("role")
        is_admin: bool = payload.get("is_admin", False)
        is_active: bool = payload.get("is_active", True)
        firstname: str = payload.get("firstname", "")
        lastname: str = payload.get("lastname", "")
        
        token_data = TokenData(
            email=email,
            role=role,
            is_admin=is_admin,
            is_active=is_active,
            firstname=firstname,
            lastname=lastname
        )
        # Agregar JTI a los datos del token para uso posterior
        token_data.jti = jti
        return token_data
    except JWTError:
        raise credentials_exception

# Función para extraer el token de cualquiera de los esquemas de autenticación
async def get_token(
    oauth2_token: str = Depends(oauth2_scheme),
    http_auth: HTTPAuthorizationCredentials = Depends(http_bearer)
) -> str:
    """
    Obtiene el token JWT de cualquiera de los esquemas de autenticación disponibles.
    Prioriza el token de OAuth2 si está disponible.

    Args:
        oauth2_token: Token de OAuth2
        http_auth: Credenciales de HTTPBearer

    Returns:
        Token JWT
    """
    # Si hay un token OAuth2, úsalo
    if oauth2_token:
        return oauth2_token

    # Si hay credenciales de HTTPBearer, usa el token
    if http_auth:
        return http_auth.credentials

    # Si no hay token, lanza una excepción
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_user_with_token_data(token: str = Depends(get_token), db: Session = Depends(get_db)):
    """
    Obtiene el usuario actual y los datos del token JWT.

    Args:
        token: Token JWT
        db: Sesión de base de datos

    Returns:
        Tuple con (usuario, token_data)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user, token_data

def get_current_user(token: str = Depends(get_token), db: Session = Depends(get_db)):
    """
    Obtiene el usuario actual a partir del token JWT.

    Args:
        token: Token JWT
        db: Sesión de base de datos

    Returns:
        Usuario actual
    """
    user, _ = get_current_user_with_token_data(token, db)
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """
    Verifica que el usuario actual esté activo.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario actual si está activo
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """
    Verifica que el usuario actual sea administrador.

    Args:
        current_user: Usuario actual

    Returns:
        Usuario actual si es administrador
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
