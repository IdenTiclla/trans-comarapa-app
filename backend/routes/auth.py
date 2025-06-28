from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from db.session import get_db
import os
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user, get_token, get_current_user_with_token_data
from auth.blacklist import token_blacklist
from auth.utils import authenticate_user, create_user
from auth.brute_force import brute_force_protection
from schemas.auth import TokenWithRoleInfo
from schemas.user import User, UserCreate
from schemas.secretary import Secretary as SecretarySchema
from models.user import User as UserModel
from models.secretary import Secretary as SecretaryModel
import logging

# Configurar logging
logger = logging.getLogger(__name__)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=TokenWithRoleInfo)
@limiter.limit("5/minute")
def login_for_access_token(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticar a un usuario y obtener un token JWT.
    Si el usuario está asociado a un rol específico (Secretary, Driver, Assistant),
    se incluye información adicional en la respuesta.

    Args:
        request: Request object para obtener IP del cliente
        response: Response object para establecer cookies
        form_data: Formulario con email y contraseña
        db: Sesión de base de datos

    Returns:
        Token JWT con información adicional según el rol del usuario
    """
    # Obtener IP del cliente
    client_ip = get_remote_address(request)
    username = form_data.username
    
    # Verificar si está bloqueado por intentos fallidos
    is_locked, lockout_reason = brute_force_protection.is_locked_out(client_ip, username)
    if is_locked:
        logger.warning(f"Login attempt blocked for {username} from {client_ip}: {lockout_reason}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Demasiados intentos fallidos. {lockout_reason}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Registrar intento fallido
        attempt_info = brute_force_protection.record_failed_attempt(client_ip, username)
        logger.warning(f"Failed login attempt for {username} from {client_ip}. Attempts: IP={attempt_info['ip_attempts']}, User={attempt_info['user_attempts']}")
        
        # Preparar mensaje de error informativo
        error_detail = "Incorrect email or password"
        remaining = brute_force_protection.get_remaining_attempts(client_ip, username)
        
        if attempt_info['ip_locked'] or attempt_info['user_locked']:
            error_detail = f"Demasiados intentos fallidos. Cuenta bloqueada por {attempt_info['lockout_duration_minutes']} minutos."
        elif remaining['user_attempts_remaining'] <= 2:
            error_detail = f"Credenciales incorrectas. Te quedan {remaining['user_attempts_remaining']} intentos antes del bloqueo."
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Login exitoso - limpiar intentos fallidos
    brute_force_protection.clear_failed_attempts(client_ip, username)
    logger.info(f"Successful login for {username} from {client_ip}")

    # 🆕 Usar propiedades de compatibilidad para obtener nombres efectivos
    effective_firstname = user.effective_firstname or ""
    effective_lastname = user.effective_lastname or ""

    # Crear token JWT con datos adicionales del usuario
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": user.email,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "firstname": effective_firstname,
        "lastname": effective_lastname
    }
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )

    # Crear refresh token con datos adicionales del usuario
    refresh_token_expires = timedelta(days=7)  # 7 días para el refresh token
    refresh_token_data = {
        "sub": user.email,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "token_type": "refresh",
        "firstname": effective_firstname,
        "lastname": effective_lastname
    }
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    # Inicializar respuesta con token y datos básicos
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convertir minutos a segundos
        "refresh_token": refresh_token,
        "refresh_token_expires_in": 7 * 24 * 60 * 60,  # 7 días en segundos
        "role": user.role,
        "user_id": user.id,
        "firstname": effective_firstname,  # ✅ Frontend sigue recibiendo esto
        "lastname": effective_lastname    # ✅ Frontend sigue recibiendo esto
    }
    
    # 🆕 Incluir información de person si existe
    if user.person:
        response_data["person"] = {
            "id": user.person.id,
            "type": user.person.type,
            "phone": user.person.phone,
            "birth_date": user.person.birth_date.isoformat() if user.person.birth_date else None,
            "avatar_url": user.person.avatar_url,
            "bio": user.person.bio
        }

    # 🔧 MANTENER compatibilidad con lógica legacy hasta completar migración
    # Esta lógica será removida en FASE 6 cuando todos los datos estén en Person
    if not user.person:
        # Solo buscar en modelos legacy si no hay Person asociado
        entity = None
        role_lower = user.role.lower() if isinstance(user.role, str) else str(user.role).lower()

        if role_lower == "secretary":
            entity = db.query(SecretaryModel).filter(SecretaryModel.user_id == user.id).first()
        elif role_lower == "driver":
            from models.driver import Driver as DriverModel
            entity = db.query(DriverModel).filter(DriverModel.user_id == user.id).first()
        elif role_lower == "assistant":
            from models.assistant import Assistant as AssistantModel
            entity = db.query(AssistantModel).filter(AssistantModel.user_id == user.id).first()
        elif role_lower == "admin":
            from models.administrator import Administrator as AdminModel
            entity = db.query(AdminModel).filter(AdminModel.user_id == user.id).first()
        elif role_lower == "client":
            from models.client import Client as ClientModel
            entity = db.query(ClientModel).filter(ClientModel.user_id == user.id).first()

        # Si encontramos entidad legacy, usar sus datos
        if entity and hasattr(entity, 'firstname'):
            response_data["firstname"] = entity.firstname or response_data["firstname"]
            response_data["lastname"] = entity.lastname or response_data["lastname"]

    # 🔒 FASE 2: Establecer cookies httpOnly para almacenamiento seguro de tokens
    # Configurar cookies con las mejores prácticas de seguridad
    is_production = os.getenv("DEBUG", "true").lower() != "true"
    cookie_settings = {
        "httponly": True,  # Previene acceso desde JavaScript (protección XSS)
        "secure": is_production,    # Solo HTTPS en producción, HTTP en desarrollo
        "samesite": "strict"  # Protección CSRF
    }
    
    # Cookie para access token (corta duración)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convertir minutos a segundos
        **cookie_settings
    )
    
    # Cookie para refresh token (larga duración)
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 días en segundos
        path="/api/v1/auth/refresh",  # Restricción de path para refresh
        **cookie_settings
    )
    
    logger.info(f"Cookies httpOnly establecidas para usuario {user.email}")

    return response_data

@router.post("/logout")
def logout(response: Response, user_data: tuple = Depends(get_current_user_with_token_data)):
    """
    Endpoint para cerrar la sesión del usuario.

    Agrega el JTI del token actual a la lista negra para invalidarlo.

    Args:
        user_data: Tupla con (usuario, token_data) que incluye el JTI

    Returns:
        Mensaje de confirmación
    """
    current_user, token_data = user_data
    
    # Agregar el JTI del token a la lista negra para invalidarlo
    if token_data.jti:
        token_blacklist.add_token_to_blacklist(token_data.jti)
        logger.info(f"User {current_user.email} logged out, token JTI {token_data.jti} blacklisted")
    
    # 🔒 FASE 2: Limpiar cookies httpOnly al hacer logout
    is_production = os.getenv("DEBUG", "true").lower() != "true"
    response.delete_cookie(key="access_token", httponly=True, secure=is_production, samesite="strict")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh", httponly=True, secure=is_production, samesite="strict")
    
    logger.info(f"Cookies httpOnly limpiadas para usuario {current_user.email}")
    
    return {"message": "Logout successful"}

@router.post("/refresh", response_model=TokenWithRoleInfo)
@limiter.limit("10/minute")
def refresh_token(request: Request, response: Response, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para refrescar el token JWT.
    Si el usuario está asociado a un rol específico (Secretary, Driver, Assistant),
    se incluye información adicional en la respuesta.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Nuevo token JWT con información adicional según el rol del usuario
    """
    # 🆕 Usar propiedades de compatibilidad para obtener nombres efectivos
    effective_firstname = current_user.effective_firstname or ""
    effective_lastname = current_user.effective_lastname or ""

    # Crear nuevo token JWT con datos adicionales del usuario
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": current_user.email,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_admin": current_user.is_admin,
        "is_active": current_user.is_active,
        "firstname": effective_firstname,
        "lastname": effective_lastname
    }
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )

    # Crear refresh token con datos adicionales del usuario
    refresh_token_expires = timedelta(days=7)  # 7 días para el refresh token
    refresh_token_data = {
        "sub": current_user.email,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "token_type": "refresh",
        "firstname": effective_firstname,
        "lastname": effective_lastname
    }
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    # Inicializar respuesta con token y datos básicos
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convertir minutos a segundos
        "refresh_token": refresh_token,
        "refresh_token_expires_in": 7 * 24 * 60 * 60,  # 7 días en segundos
        "role": current_user.role,
        "user_id": current_user.id,
        "firstname": effective_firstname,  # ✅ Frontend sigue recibiendo esto
        "lastname": effective_lastname    # ✅ Frontend sigue recibiendo esto
    }
    
    # 🆕 Incluir información de person si existe
    if current_user.person:
        response_data["person"] = {
            "id": current_user.person.id,
            "type": current_user.person.type,
            "phone": current_user.person.phone,
            "birth_date": current_user.person.birth_date.isoformat() if current_user.person.birth_date else None,
            "avatar_url": current_user.person.avatar_url,
            "bio": current_user.person.bio
        }

    # 🔧 MANTENER compatibilidad con lógica legacy hasta completar migración
    if not current_user.person:
        # Solo buscar en modelos legacy si no hay Person asociado
        entity = None
        role_lower = current_user.role.lower() if isinstance(current_user.role, str) else str(current_user.role).lower()

        if role_lower == "secretary":
            entity = db.query(SecretaryModel).filter(SecretaryModel.user_id == current_user.id).first()
        elif role_lower == "driver":
            from models.driver import Driver as DriverModel
            entity = db.query(DriverModel).filter(DriverModel.user_id == current_user.id).first()
        elif role_lower == "assistant":
            from models.assistant import Assistant as AssistantModel
            entity = db.query(AssistantModel).filter(AssistantModel.user_id == current_user.id).first()
        elif role_lower == "admin":
            from models.administrator import Administrator as AdminModel
            entity = db.query(AdminModel).filter(AdminModel.user_id == current_user.id).first()
        elif role_lower == "client":
            from models.client import Client as ClientModel
            entity = db.query(ClientModel).filter(ClientModel.user_id == current_user.id).first()

        # Si encontramos entidad legacy, usar sus datos
        if entity and hasattr(entity, 'firstname'):
            response_data["firstname"] = entity.firstname or response_data["firstname"]
            response_data["lastname"] = entity.lastname or response_data["lastname"]

    # 🔒 FASE 2: Establecer cookies httpOnly para tokens refrescados
    is_production = os.getenv("DEBUG", "true").lower() != "true"
    cookie_settings = {
        "httponly": True,
        "secure": is_production,
        "samesite": "strict"
    }
    
    # Establecer nuevas cookies con los tokens refrescados
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_settings
    )
    
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,
        path="/api/v1/auth/refresh",
        **cookie_settings
    )
    
    logger.info(f"Cookies httpOnly actualizadas para usuario {current_user.email}")

    return response_data

@router.post("/register", response_model=User)
@limiter.limit("3/minute")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar un nuevo usuario.

    Args:
        user: Datos del usuario a registrar
        db: Sesión de base de datos

    Returns:
        Usuario registrado
    """
    # Verificar si el email ya está registrado
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)

@router.get("/me", response_model=User)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """
    Endpoint para obtener información del usuario actual.

    Args:
        current_user: Usuario actual

    Returns:
        Información del usuario actual
    """
    return current_user

@router.put("/me", response_model=User)
def update_user_me(user_update: UserCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """
    Endpoint para actualizar información del usuario actual.

    Args:
        user_update: Datos actualizados del usuario
        db: Sesión de base de datos
        current_user: Usuario actual

    Returns:
        Usuario actualizado
    """
    # Verificar si el nuevo email ya está en uso por otro usuario
    if user_update.email != current_user.email:
        db_user = db.query(UserModel).filter(UserModel.email == user_update.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Actualizar datos del usuario
    current_user.email = user_update.email
    current_user.username = user_update.username

    # Solo actualizar la contraseña si se proporciona una nueva
    if hasattr(user_update, 'password') and user_update.password:
        current_user.hashed_password = UserModel.get_password_hash(user_update.password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/person", response_model=dict)
def get_current_user_person(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener la información de la persona asociada al usuario actual,
    independientemente de su rol (Secretary, Driver, Assistant, Client, Administrator).

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Información de la persona asociada al usuario actual
    """
    result = {
        "role": current_user.role,
        "entity_id": None,
        "entity_type": None,
        "entity_data": None,
        "firstname": current_user.firstname or "",
        "lastname": current_user.lastname or ""
    }

    if current_user.role == "secretary":
        secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == current_user.id).first()
        if secretary:
            result["entity_id"] = secretary.id
            result["entity_type"] = "secretary"
            result["entity_data"] = {
                "id": secretary.id,
                "firstname": secretary.firstname,
                "lastname": secretary.lastname,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": secretary.phone
            }

    elif current_user.role == "driver":
        from models.driver import Driver as DriverModel
        driver = db.query(DriverModel).filter(DriverModel.user_id == current_user.id).first()
        if driver:
            result["entity_id"] = driver.id
            result["entity_type"] = "driver"
            result["entity_data"] = {
                "id": driver.id,
                "firstname": driver.firstname,
                "lastname": driver.lastname,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": driver.phone,
                "license_number": driver.license_number,
                "experience_years": driver.experience_years
            }

    elif current_user.role == "assistant":
        from models.assistant import Assistant as AssistantModel
        assistant = db.query(AssistantModel).filter(AssistantModel.user_id == current_user.id).first()
        if assistant:
            result["entity_id"] = assistant.id
            result["entity_type"] = "assistant"
            result["entity_data"] = {
                "id": assistant.id,
                "firstname": assistant.firstname,
                "lastname": assistant.lastname,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": assistant.phone
            }

    elif current_user.role == "client":
        from models.client import Client as ClientModel
        client = db.query(ClientModel).filter(ClientModel.user_id == current_user.id).first()
        if client:
            result["entity_id"] = client.id
            result["entity_type"] = "client"
            result["entity_data"] = {
                "id": client.id,
                "firstname": client.firstname,
                "lastname": client.lastname,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": client.phone,
                "address": client.address,
                "city": client.city,
                "state": client.state
            }

    elif current_user.role == "admin":
        from models.administrator import Administrator as AdministratorModel
        administrator = db.query(AdministratorModel).filter(AdministratorModel.user_id == current_user.id).first()
        if administrator:
            result["entity_id"] = administrator.id
            result["entity_type"] = "administrator"
            result["entity_data"] = {
                "id": administrator.id,
                "firstname": administrator.firstname,
                "lastname": administrator.lastname,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": administrator.phone
            }

    if result["entity_id"] is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No person is associated with the current user (role: {current_user.role})"
        )

    return result

@router.get("/me/secretary", response_model=SecretarySchema)
def get_current_user_secretary(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener el secretario asociado al usuario actual.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Secretario asociado al usuario actual
    """
    # Verificar que el usuario tenga el rol de secretario
    if current_user.role != "secretary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a secretary"
        )

    # Buscar el secretario asociado al usuario actual
    secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == current_user.id).first()

    if not secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No secretary is associated with the current user"
        )

    return secretary

@router.get("/me/driver", response_model=dict)
def get_current_user_driver(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener el conductor asociado al usuario actual.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Conductor asociado al usuario actual
    """
    # Verificar que el usuario tenga el rol de conductor
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a driver"
        )

    # Buscar el conductor asociado al usuario actual
    from models.driver import Driver as DriverModel
    driver = db.query(DriverModel).filter(DriverModel.user_id == current_user.id).first()

    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No driver is associated with the current user"
        )

    return {
        "id": driver.id,
        "firstname": driver.firstname,
        "lastname": driver.lastname,
        "email": current_user.email,  # Obtener el email del usuario asociado
        "phone": driver.phone,
        "license_number": driver.license_number,
        "experience_years": driver.experience_years
    }

@router.get("/me/assistant", response_model=dict)
def get_current_user_assistant(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener el asistente asociado al usuario actual.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Asistente asociado al usuario actual
    """
    # Verificar que el usuario tenga el rol de asistente
    if current_user.role != "assistant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an assistant"
        )

    # Buscar el asistente asociado al usuario actual
    from models.assistant import Assistant as AssistantModel
    assistant = db.query(AssistantModel).filter(AssistantModel.user_id == current_user.id).first()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assistant is associated with the current user"
        )

    return {
        "id": assistant.id,
        "firstname": assistant.firstname,
        "lastname": assistant.lastname,
        "email": current_user.email,  # Obtener el email del usuario asociado
        "phone": assistant.phone
    }

@router.get("/me/client", response_model=dict)
def get_current_user_client(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener el cliente asociado al usuario actual.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Cliente asociado al usuario actual
    """
    # Verificar que el usuario tenga el rol de cliente
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a client"
        )

    # Buscar el cliente asociado al usuario actual
    from models.client import Client as ClientModel
    client = db.query(ClientModel).filter(ClientModel.user_id == current_user.id).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No client is associated with the current user"
        )

    return {
        "id": client.id,
        "firstname": client.firstname,
        "lastname": client.lastname,
        "email": current_user.email,  # Obtener el email del usuario asociado
        "phone": client.phone,
        "address": client.address,
        "city": client.city,
        "state": client.state
    }

@router.get("/me/administrator", response_model=dict)
def get_current_user_administrator(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para obtener el administrador asociado al usuario actual.

    Args:
        current_user: Usuario actual
        db: Sesión de base de datos

    Returns:
        Administrador asociado al usuario actual
    """
    # Verificar que el usuario tenga el rol de administrador
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an administrator"
        )

    # Buscar el administrador asociado al usuario actual
    from models.administrator import Administrator as AdministratorModel
    administrator = db.query(AdministratorModel).filter(AdministratorModel.user_id == current_user.id).first()

    if not administrator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No administrator is associated with the current user"
        )

    return {
        "id": administrator.id,
        "firstname": administrator.firstname,
        "lastname": administrator.lastname,
        "email": current_user.email,  # Obtener el email del usuario asociado
        "phone": administrator.phone
    }

@router.post("/users", response_model=User)
def create_new_user(user: UserCreate, db: Session = Depends(get_db), _: UserModel = Depends(get_current_admin_user)):
    """
    Endpoint para crear un nuevo usuario (solo administradores).

    Args:
        user: Datos del usuario a crear
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser administrador)

    Returns:
        Usuario creado
    """
    # Verificar si el email ya está registrado
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)

@router.get("/verify")
def verify_token(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint para verificar si el token JWT actual es válido.
    
    Args:
        current_user: Usuario actual (obtenido del token)
        db: Sesión de base de datos
        
    Returns:
        Información básica del usuario si el token es válido
    """
    # Si llegamos aquí, el token es válido (get_current_user ya lo validó)
    return {
        "valid": True,
        "user_id": current_user.id,
        "email": current_user.email,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_active": current_user.is_active,
        "firstname": current_user.effective_firstname or "",  # 🆕 Usar propiedad de compatibilidad
        "lastname": current_user.effective_lastname or "",    # 🆕 Usar propiedad de compatibilidad
        "person": {
            "id": current_user.person.id,
            "type": current_user.person.type,
            "phone": current_user.person.phone,
            "avatar_url": current_user.person.avatar_url
        } if current_user.person else None  # 🆕 Incluir datos de person si existe
    }
