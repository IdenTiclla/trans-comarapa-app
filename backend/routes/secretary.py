from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.secretary import Secretary as SecretaryModel
from models.trip import Trip as TripModel
from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from models.user import User as UserModel
from schemas.secretary import SecretaryCreate, Secretary as SecretarySchema
from schemas.trip import Trip as TripSchema
from schemas.ticket import Ticket as TicketSchema
from schemas.secretary_user import SecretaryUserLink
from schemas.auth import User as UserSchema
from typing import List, Dict
from auth.jwt import get_current_admin_user, get_current_user



router = APIRouter(
    tags=["Secretaries"]
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


@router.post("", response_model=SecretarySchema, status_code=status.HTTP_201_CREATED)
async def create_secretary(secretary: SecretaryCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    # Validate if a secretary with the same name already exists
    existing_secretary = db.query(SecretaryModel).filter(SecretaryModel.name == secretary.name).first()
    if existing_secretary:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A secretary with this name already exists"
        )

    # Validate if the name is not empty
    if not secretary.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Secretary name cannot be empty"
        )

    # Si se proporciona un user_id, verificar que el usuario existe
    if secretary.user_id is not None:
        # Verificar que el usuario existe
        db_user = db.query(UserModel).filter(UserModel.id == secretary.user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {secretary.user_id} not found"
            )

        # Verificar que el usuario no esté ya asociado a otro secretario
        existing_secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == secretary.user_id).first()
        if existing_secretary:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with id {secretary.user_id} is already linked to another secretary (ID: {existing_secretary.id})"
            )

    # Create new secretary
    db_secretary = SecretaryModel(**secretary.model_dump())
    db.add(db_secretary)
    try:
        db.commit()
        db.refresh(db_secretary)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the secretary: {str(e)}"
        )
    return db_secretary

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

@router.post("/{secretary_id}/link-user", response_model=SecretarySchema)
async def link_secretary_to_user(
    secretary_id: int,
    link_data: SecretaryUserLink,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """
    Asocia un secretario existente con una cuenta de usuario existente.
    Solo los administradores pueden realizar esta operación.

    Args:
        secretary_id: ID del secretario a asociar
        link_data: Datos de la asociación (ID del usuario)
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser administrador)

    Returns:
        El secretario actualizado con la información del usuario asociado
    """
    # Verificar que el secretario existe
    db_secretary = db.query(SecretaryModel).filter(SecretaryModel.id == secretary_id).first()
    if not db_secretary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Secretary with id {secretary_id} not found"
        )

    # Verificar que el usuario existe
    db_user = db.query(UserModel).filter(UserModel.id == link_data.user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {link_data.user_id} not found"
        )

    # Verificar que el usuario no esté ya asociado a otro secretario
    existing_secretary = db.query(SecretaryModel).filter(SecretaryModel.user_id == link_data.user_id).first()
    if existing_secretary and existing_secretary.id != secretary_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with id {link_data.user_id} is already linked to another secretary (ID: {existing_secretary.id})"
        )

    # Verificar que el secretario no esté ya asociado a otro usuario
    if db_secretary.user_id and db_secretary.user_id != link_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Secretary with id {secretary_id} is already linked to another user (ID: {db_secretary.user_id})"
        )

    # Asociar el usuario con el secretario
    db_secretary.user_id = link_data.user_id

    try:
        db.commit()
        db.refresh(db_secretary)
        return db_secretary
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while linking the secretary to the user: {str(e)}"
        )

@router.delete("/{secretary_id}/unlink-user", response_model=SecretarySchema)
async def unlink_secretary_from_user(
    secretary_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """
    Desvincula un secretario de su cuenta de usuario asociada.
    Solo los administradores pueden realizar esta operación.

    Args:
        secretary_id: ID del secretario a desvincular
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser administrador)

    Returns:
        El secretario actualizado sin la información del usuario asociado
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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Secretary with id {secretary_id} is not linked to any user"
        )

    # Desvincular el usuario del secretario
    db_secretary.user_id = None

    try:
        db.commit()
        db.refresh(db_secretary)
        return db_secretary
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while unlinking the secretary from the user: {str(e)}"
        )

@router.get("/{secretary_id}/user", response_model=UserSchema)
async def get_secretary_user(
    secretary_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
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