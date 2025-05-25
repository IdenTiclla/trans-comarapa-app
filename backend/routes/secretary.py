from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.secretary import Secretary as SecretaryModel
from models.trip import Trip as TripModel
from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from models.user import User as UserModel
from schemas.secretary import Secretary as SecretarySchema
from schemas.trip import Trip as TripSchema
from schemas.ticket import Ticket as TicketSchema
from schemas.secretary_with_user import SecretaryWithUser, SecretaryWithUserResponse
from schemas.auth import User as UserSchema
from schemas.user import UserCreate
from typing import List, Dict
from auth.jwt import get_current_admin_user, get_current_user



router = APIRouter(
    tags=["Secretaries"]
)

@router.post("", response_model=SecretaryWithUserResponse, status_code=status.HTTP_201_CREATED)
async def create_secretary_with_user(secretary_data: SecretaryWithUser, db: Session = Depends(get_db), _: UserModel = Depends(get_current_admin_user)):
    """
    Crea un nuevo secretario junto con su usuario asociado en una sola operación.
    Este es el único endpoint para crear secretarios.
    Solo los administradores pueden realizar esta operación.

    Args:
        secretary_data: Datos del secretario y del usuario a crear
        db: Sesión de base de datos
        _: Usuario actual (debe ser administrador)

    Returns:
        Información del secretario y usuario creados
    """
    # Verificar si el email ya está registrado
    db_user = db.query(UserModel).filter(UserModel.email == secretary_data.user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Verificar si el username ya está registrado
    db_user = db.query(UserModel).filter(UserModel.username == secretary_data.user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Iniciar transacción
    try:
        # 1. Crear el usuario
        user_create = UserCreate(
            username=secretary_data.user.username,
            email=secretary_data.user.email,
            password=secretary_data.user.password,
            role="secretary",  # Asignar rol de secretario
            is_active=secretary_data.user.is_active,
            is_admin=secretary_data.user.is_admin
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

        # 2. Crear el secretario
        db_secretary = SecretaryModel(
            firstname=secretary_data.firstname,
            lastname=secretary_data.lastname,
            phone=secretary_data.phone,
            birth_date=secretary_data.birth_date,
            office_id=secretary_data.office_id,
            user_id=db_user.id  # Asociar con el usuario recién creado
        )
        db.add(db_secretary)
        db.flush()  # Obtener el ID del secretario sin hacer commit

        # 3. Confirmar la transacción
        db.commit()
        db.refresh(db_secretary)
        db.refresh(db_user)

        # 4. Preparar la respuesta
        response = SecretaryWithUserResponse(
            secretary_id=db_secretary.id,
            user_id=db_user.id,
            firstname=db_secretary.firstname,
            lastname=db_secretary.lastname,
            phone=db_secretary.phone,
            birth_date=db_secretary.birth_date,
            office_id=db_secretary.office_id,
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
            detail=f"An error occurred while creating the secretary with user: {str(e)}"
        )

@router.get("", response_model=List[SecretarySchema])
async def get_secretaries(db: Session = Depends(get_db)):
    secretaries = db.query(SecretaryModel).all()
    return secretaries

@router.get("/{secretary_id}", response_model=SecretarySchema)
async def get_secretary(secretary_id: int, db: Session = Depends(get_db)):
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )
    return db_secretary

@router.get("/{secretary_id}/trips", response_model=List[TripSchema])
async def get_secretary_trips(secretary_id: int, db:Session = Depends(get_db)):
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )

    trips = db.query(TripModel).filter(TripModel.secretary_id == secretary_id).all()
    return trips

@router.get("/{secretary_id}/tickets", response_model=List[TicketSchema])
async def get_secretary_tickets(secretary_id: int, db: Session = Depends(get_db)):
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )

    tickets = db.query(TicketModel).filter(TicketModel.secretary_id == secretary_id).all()
    return tickets


# Endpoint eliminado: create_secretary
# Este endpoint es redundante ahora que tenemos create_secretary_with_user
# Para crear un secretario sin usuario asociado, se puede usar create_secretary_with_user
# y luego desvincular el usuario si es necesario

@router.delete("/{secretary_id}", response_model=Dict[str, str])
async def delete_secretary(secretary_id: int, db: Session = Depends(get_db)):
    # First check if the secretary exists
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )

    # Check if there are any trips associated with this secretary
    trips = db.query(TripModel).filter(TripModel.secretary_id == secretary_id).all()
    if trips:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(trips)} associated trips. Reassign the trips to another secretary first."
        )

    # Check if there are any tickets associated with this secretary
    tickets = db.query(TicketModel).filter(TicketModel.secretary_id == secretary_id).all()
    if tickets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(tickets)} associated tickets. Reassign the tickets to another secretary first."
        )

    # Check if there are any packages associated with this secretary
    packages = db.query(PackageModel).filter(PackageModel.secretary_id == secretary_id).all()
    if packages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete secretary with id {secretary_id} because they have {len(packages)} associated packages. Reassign the packages to another secretary first."
        )

    # If no dependencies, proceed with deletion
    db.delete(db_secretary)
    db.commit()

    return {"message": f"Secretary with id {secretary_id} has been successfully deleted"}

# Endpoint eliminado: link_secretary_to_user
# Este endpoint es redundante ahora que tenemos create_secretary_with_user

# Endpoint eliminado: unlink_secretary_from_user
# Este endpoint es redundante ahora que tenemos create_secretary_with_user

@router.get("/{secretary_id}/user", response_model=UserSchema)
async def get_secretary_user(
    secretary_id: int,
    db: Session = Depends(get_db),
    _: UserModel = Depends(get_current_user)
):
    """
    Obtiene el usuario asociado a un secretario.

    Args:
        secretary_id: ID del secretario
        db: Sesión de base de datos
        current_user: Usuario actual (para autenticación)

    Returns:
        El usuario asociado al secretario
    """
    # Verificar que el secretario existe
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )

    # Verificar que el secretario tenga un usuario asociado
    if not db_secretary.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} is not linked to any user"
        )

    # Obtener el usuario asociado
    db_user = db.query(UserModel).filter(UserModel.id == db_secretary.user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {db_secretary.user_id} not found"
        )

    return db_user

@router.get("/by-user/{user_id}", response_model=SecretarySchema)
async def get_secretary_by_user_id(user_id: int, db: Session = Depends(get_db)):
    """Obtener secretario por user_id"""
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == user_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with user_id {user_id} not found"
        )
    return db_secretary