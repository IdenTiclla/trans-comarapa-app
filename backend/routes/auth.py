from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.session import get_db
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user, get_token
from auth.blacklist import token_blacklist
from auth.utils import authenticate_user, create_user
from schemas.auth import TokenWithRoleInfo
from schemas.user import User, UserCreate
from schemas.secretary import Secretary as SecretarySchema
from models.user import User as UserModel
from models.secretary import Secretary as SecretaryModel
import logging

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=TokenWithRoleInfo)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticar a un usuario y obtener un token JWT.
    Si el usuario está asociado a un rol específico (Secretary, Driver, Assistant),
    se incluye información adicional en la respuesta.

    Args:
        form_data: Formulario con email y contraseña
        db: Sesión de base de datos

    Returns:
        Token JWT con información adicional según el rol del usuario
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear token JWT con datos adicionales del usuario
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": user.email,
        "role": str(user.role.value) if hasattr(user.role, 'value') else str(user.role),
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "firstname": user.firstname or "",
        "lastname": user.lastname or ""
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
        "firstname": user.firstname or "",
        "lastname": user.lastname or ""
    }
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    # Inicializar respuesta con token y datos básicos
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convertir minutos a segundos
        "refresh_token": refresh_token,
        "refresh_token_expires_in": 7 * 24 * 60 * 60,  # 7 días en segundos
        "role": user.role,
        "user_id": user.id,
        "firstname": user.firstname or "",  # Usar datos del usuario directamente
        "lastname": user.lastname or ""   # Usar datos del usuario directamente
    }

    # Obtener la entidad asociada al usuario según su rol
    entity = None

    # Normalizar el rol a minúsculas para comparación
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

    # Si encontramos la entidad y el usuario no tiene firstname o lastname, usar los de la entidad
    if entity:
        if not user.firstname and hasattr(entity, 'firstname'):
            response["firstname"] = entity.firstname

        if not user.lastname and hasattr(entity, 'lastname'):
            response["lastname"] = entity.lastname

    return response

@router.post("/logout")
def logout(token: str = Depends(get_token)):
    """
    Endpoint para cerrar la sesión del usuario.

    Agrega el token actual a la lista negra para invalidarlo.

    Args:
        token: Token JWT actual

    Returns:
        Mensaje de confirmación
    """
    # Agregar el token a la lista negra
    # El token expirará en la lista negra después de su tiempo de expiración original
    # o después de 24 horas, lo que ocurra primero
    token_blacklist.add_token_to_blacklist(token)

    return {"message": "Logout successful"}

@router.post("/refresh", response_model=TokenWithRoleInfo)
def refresh_token(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
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
    # Crear nuevo token JWT con datos adicionales del usuario
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": current_user.email,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_admin": current_user.is_admin,
        "is_active": current_user.is_active,
        "firstname": current_user.firstname or "",
        "lastname": current_user.lastname or ""
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
        "firstname": current_user.firstname or "",
        "lastname": current_user.lastname or ""
    }
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    # Inicializar respuesta con token y datos básicos
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convertir minutos a segundos
        "refresh_token": refresh_token,
        "refresh_token_expires_in": 7 * 24 * 60 * 60,  # 7 días en segundos
        "role": current_user.role,
        "user_id": current_user.id,
        "firstname": current_user.firstname or "",  # Usar datos del usuario directamente
        "lastname": current_user.lastname or ""   # Usar datos del usuario directamente
    }

    # Obtener la entidad asociada al usuario según su rol
    entity = None

    # Normalizar el rol a minúsculas para comparación
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

    # Si encontramos la entidad y el usuario no tiene firstname o lastname, usar los de la entidad
    if entity:
        if not current_user.firstname and hasattr(entity, 'firstname'):
            response["firstname"] = entity.firstname

        if not current_user.lastname and hasattr(entity, 'lastname'):
            response["lastname"] = entity.lastname

    return response

@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
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
