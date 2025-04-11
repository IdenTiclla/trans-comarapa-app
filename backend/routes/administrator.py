from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.administrator import Administrator as AdministratorModel
from models.user import User as UserModel
from schemas.administrator import Administrator as AdministratorSchema
from schemas.administrator_with_user import AdministratorWithUser, AdministratorWithUserResponse
from schemas.user import UserCreate
from typing import List
from auth.jwt import get_current_admin_user

router = APIRouter(
    tags=["Administrators"]
)

@router.post("", response_model=AdministratorWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_administrator_with_user(administrator_data: AdministratorWithUser, db: Session = Depends(get_db)):
    """
    Crea un nuevo administrador junto con su usuario asociado en una sola operación.
    Este es el único endpoint para crear administradores.
    Solo los administradores pueden realizar esta operación.

    Args:
        administrator_data: Datos del administrador y del usuario a crear
        db: Sesión de base de datos
        _: Usuario actual (debe ser administrador)

    Returns:
        Información del administrador y usuario creados
    """
    # Verificar si el email ya está registrado
    db_user = db.query(UserModel).filter(UserModel.email == administrator_data.user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Verificar si el username ya está registrado
    db_user = db.query(UserModel).filter(UserModel.username == administrator_data.user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Iniciar transacción
    try:
        # 1. Crear el usuario
        user_create = UserCreate(
            username=administrator_data.user.username,
            email=administrator_data.user.email,
            password=administrator_data.user.password,
            role="admin",  # Asignar rol de administrador
            is_active=administrator_data.user.is_active,
            is_admin=administrator_data.user.is_admin
        )

        hashed_password = UserModel.get_password_hash(user_create.password)
        db_user = UserModel(
            username=user_create.username,
            email=user_create.email,
            hashed_password=hashed_password,
            role=user_create.role,
            is_active=user_create.is_active,
            is_admin=user_create.is_admin
        )
        db.add(db_user)
        db.flush()  # Obtener el ID del usuario sin hacer commit

        # 2. Crear el administrador
        db_administrator = AdministratorModel(
            firstname=administrator_data.firstname,
            lastname=administrator_data.lastname,
            phone=administrator_data.phone,
            birth_date=administrator_data.birth_date,
            user_id=db_user.id  # Asociar con el usuario recién creado
        )
        db.add(db_administrator)
        db.flush()  # Obtener el ID del administrador sin hacer commit

        # 3. Confirmar la transacción
        db.commit()
        db.refresh(db_administrator)
        db.refresh(db_user)

        # 4. Preparar la respuesta
        response = AdministratorWithUserResponse(
            administrator_id=db_administrator.id,
            user_id=db_user.id,
            firstname=db_administrator.firstname,
            lastname=db_administrator.lastname,
            phone=db_administrator.phone,
            birth_date=db_administrator.birth_date,
            username=db_user.username,
            email=db_user.email,
            is_active=db_user.is_active,
            is_admin=db_user.is_admin
        )

        return response

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the administrator with user: {str(e)}"
        )

@router.get("", response_model=List[AdministratorSchema])
async def get_administrators(db: Session = Depends(get_db), _: UserModel = Depends(get_current_admin_user)):
    """
    Obtiene la lista de todos los administradores.
    Solo los administradores pueden realizar esta operación.

    Args:
        db: Sesión de base de datos
        _: Usuario actual (debe ser administrador)

    Returns:
        Lista de administradores
    """
    administrators = db.query(AdministratorModel).all()
    return administrators

@router.get("/{administrator_id}", response_model=AdministratorSchema)
async def get_administrator(administrator_id: int, db: Session = Depends(get_db), _: UserModel = Depends(get_current_admin_user)):
    """
    Obtiene un administrador por su ID.
    Solo los administradores pueden realizar esta operación.

    Args:
        administrator_id: ID del administrador a obtener
        db: Sesión de base de datos
        _: Usuario actual (debe ser administrador)

    Returns:
        Administrador encontrado
    """
    administrator = db.query(AdministratorModel).filter(AdministratorModel.id == administrator_id).first()
    if not administrator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Administrator with ID {administrator_id} not found"
        )
    return administrator
