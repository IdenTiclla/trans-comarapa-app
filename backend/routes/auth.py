from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.session import get_db
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user, get_token
from auth.blacklist import token_blacklist
from auth.utils import authenticate_user, create_user
from schemas.auth import Token, TokenWithSecretaryInfo, TokenWithRoleInfo, User, UserCreate
from schemas.secretary import Secretary as SecretarySchema
from models.user import User as UserModel
from models.secretary import Secretary as SecretaryModel

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

    # Crear token JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "is_admin": user.is_admin, "is_active": user.is_active},
        expires_delta=access_token_expires
    )

    # Inicializar respuesta con token
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "secretary_id": None,
        "secretary_name": None,
        "driver_id": None,
        "driver_name": None,
        "assistant_id": None,
        "assistant_name": None
    }

    # Verificar el rol del usuario y agregar información adicional según corresponda
    if user.role == "secretary":
        secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == user.id).first()
        if secretary:
            response["secretary_id"] = secretary.id
            response["secretary_name"] = secretary.name

    elif user.role == "driver":
        from models.driver import Driver as DriverModel
        driver = db.query(DriverModel).filter(DriverModel.user_id == user.id).first()
        if driver:
            response["driver_id"] = driver.id
            response["driver_name"] = driver.name

    elif user.role == "assistant":
        from models.assistant import Assistant as AssistantModel
        assistant = db.query(AssistantModel).filter(AssistantModel.user_id == user.id).first()
        if assistant:
            response["assistant_id"] = assistant.id
            response["assistant_name"] = assistant.name

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
    # Crear nuevo token JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email, "role": current_user.role, "is_admin": current_user.is_admin, "is_active": current_user.is_active},
        expires_delta=access_token_expires
    )

    # Inicializar respuesta con token
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "secretary_id": None,
        "secretary_name": None,
        "driver_id": None,
        "driver_name": None,
        "assistant_id": None,
        "assistant_name": None
    }

    # Verificar el rol del usuario y agregar información adicional según corresponda
    if current_user.role == "secretary":
        secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == current_user.id).first()
        if secretary:
            response["secretary_id"] = secretary.id
            response["secretary_name"] = secretary.name

    elif current_user.role == "driver":
        from models.driver import Driver as DriverModel
        driver = db.query(DriverModel).filter(DriverModel.user_id == current_user.id).first()
        if driver:
            response["driver_id"] = driver.id
            response["driver_name"] = driver.name

    elif current_user.role == "assistant":
        from models.assistant import Assistant as AssistantModel
        assistant = db.query(AssistantModel).filter(AssistantModel.user_id == current_user.id).first()
        if assistant:
            response["assistant_id"] = assistant.id
            response["assistant_name"] = assistant.name

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
    current_user.full_name = user_update.full_name

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
        "person_id": None,
        "person_type": None,
        "person_data": None
    }

    if current_user.role == "secretary":
        secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == current_user.id).first()
        if secretary:
            result["person_id"] = secretary.id
            result["person_type"] = "secretary"
            result["person_data"] = {
                "id": secretary.id,
                "name": secretary.name,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": secretary.phone
            }

    elif current_user.role == "driver":
        from models.driver import Driver as DriverModel
        driver = db.query(DriverModel).filter(DriverModel.user_id == current_user.id).first()
        if driver:
            result["person_id"] = driver.id
            result["person_type"] = "driver"
            result["person_data"] = {
                "id": driver.id,
                "name": driver.name,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": driver.phone,
                "license_number": driver.license_number,
                "experience_years": driver.experience_years
            }

    elif current_user.role == "assistant":
        from models.assistant import Assistant as AssistantModel
        assistant = db.query(AssistantModel).filter(AssistantModel.user_id == current_user.id).first()
        if assistant:
            result["person_id"] = assistant.id
            result["person_type"] = "assistant"
            result["person_data"] = {
                "id": assistant.id,
                "name": assistant.name,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": assistant.phone
            }

    elif current_user.role == "client":
        from models.client import Client as ClientModel
        client = db.query(ClientModel).filter(ClientModel.user_id == current_user.id).first()
        if client:
            result["person_id"] = client.id
            result["person_type"] = "client"
            result["person_data"] = {
                "id": client.id,
                "name": client.name,
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
            result["person_id"] = administrator.id
            result["person_type"] = "administrator"
            result["person_data"] = {
                "id": administrator.id,
                "name": administrator.name,
                "email": current_user.email,  # Obtener el email del usuario asociado
                "phone": administrator.phone
            }

    if result["person_id"] is None:
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
        "name": driver.name,
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
        "name": assistant.name,
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
        "name": client.name,
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
        "name": administrator.name,
        "email": current_user.email,  # Obtener el email del usuario asociado
        "phone": administrator.phone
    }

@router.post("/users", response_model=User)
def create_new_user(user: UserCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
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
