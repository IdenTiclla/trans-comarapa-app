from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.session import get_db
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user
from auth.utils import authenticate_user, create_user
from schemas.auth import Token, User, UserCreate
from models.user import User as UserModel

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para autenticar a un usuario y obtener un token JWT.

    Args:
        form_data: Formulario con email y contraseña
        db: Sesión de base de datos

    Returns:
        Token JWT
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "is_admin": user.is_admin, "is_active": user.is_active},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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
