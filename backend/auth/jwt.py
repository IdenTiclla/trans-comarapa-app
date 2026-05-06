from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Cookie, Header
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from schemas.auth import TokenData
from auth.blacklist import token_blacklist
from core.config import settings
import uuid

SECRET_KEY = settings.JWT_SECRET_KEY
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required and must not be empty")
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES

# 🔒 FASE 3: Eliminadas configuraciones OAuth2 y HTTPBearer - solo cookies httpOnly

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
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
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
        
        token_type: str = payload.get("token_type")

        token_data = TokenData(
            email=email,
            role=role,
            is_admin=is_admin,
            is_active=is_active,
            firstname=firstname,
            lastname=lastname,
            token_type=token_type
        )
        # Agregar JTI a los datos del token para uso posterior
        token_data.jti = jti
        return token_data
    except JWTError:
        raise credentials_exception

# 🔒 FASE 3: Función para obtener token desde cookies httpOnly o Authorization header (para testing)
async def get_token(
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Obtiene el token JWT desde cookies httpOnly o Authorization header.
    En producción se prioriza cookies httpOnly, pero se permite Authorization header para testing.

    Args:
        access_token: Token desde cookie httpOnly
        authorization: Token desde Authorization header

    Returns:
        Token JWT

    Raises:
        HTTPException: Si no se encuentra el token
    """
    # Primero intentar obtener desde cookies httpOnly (producción)
    if access_token:
        return access_token

    # Para testing y compatibilidad, permitir Authorization header
    if authorization:
        # Extraer token del header "Bearer <token>"
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                return token
        except ValueError:
            pass

    # Si no hay token en ningún lado, lanza una excepción
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated - cookie or Authorization header required",
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

async def get_refresh_token(
    refresh_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Obtiene el refresh token desde la cookie httpOnly o Authorization header (testing).
    """
    if refresh_token:
        return refresh_token

    # Para testing, permitir Authorization header
    if authorization:
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer":
                return token
        except ValueError:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token not found",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_user_from_refresh_token(token: str = Depends(get_refresh_token), db: Session = Depends(get_db)):
    """
    Valida el refresh token y devuelve el usuario asociado.
    A diferencia de get_current_user, este lee la cookie 'refresh_token'
    y verifica que el token sea de tipo refresh.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)

    # Verificar que sea un refresh token
    if token_data.token_type != "refresh":
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user
