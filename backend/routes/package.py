from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from schemas.package import Package as PackageSchema, PackageCreate, PackageUpdate
from models.package import Package as PackageModel
from models.secretary import Secretary as SecretaryModel
from schemas.client import Client
from schemas.trip import Trip

from db.session import get_db

router = APIRouter(
    tags=["Packages"]
)

@router.get("", response_model=List[PackageSchema])
async def get_packages(db: Session = Depends(get_db)):
    packages = db.query(PackageModel).all()
    return packages


@router.post("", response_model=PackageSchema)
async def create_package(package: PackageCreate, db: Session = Depends(get_db)):
    print(f"[DEBUG] Creating package with data: {package}")
    
    # Find the Secretary entity ID based on the operator_user_id
    # The package.operator_user_id is the user_id of the secretary/admin creating the package
    print(f"[DEBUG] Looking for secretary profile with user_id: {package.operator_user_id}")
    secretary_profile = db.query(SecretaryModel).filter(SecretaryModel.user_id == package.operator_user_id).first()
    if not secretary_profile:
        print(f"[DEBUG] No secretary profile found for user ID {package.operator_user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No secretary profile found for user ID {package.operator_user_id}. Cannot create package."
        )
    
    actual_secretary_id = secretary_profile.id
    print(f"[DEBUG] Secretary profile found: {actual_secretary_id}")
    
    # Create package data dict and replace operator_user_id with secretary_id
    package_data = package.model_dump()
    package_data.pop('operator_user_id', None)  # Remove operator_user_id field
    package_data['secretary_id'] = actual_secretary_id  # Add actual secretary_id
    
    print(f"[DEBUG] Package data with corrected secretary_id: {package_data}")
    
    db_package = PackageModel(**package_data)
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    print(f"[DEBUG] Package created successfully: {db_package.id}")
    return db_package

@router.get("/{package_id}", response_model=PackageSchema)
async def get_package(package_id: int, db: Session = Depends(get_db)):
    db_package = db.query(PackageModel).filter(PackageModel.id==package_id).first()
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")
    return db_package


@router.put("/{package_id}", response_model=PackageSchema)
async def update_package(package_id: int, package: PackageUpdate, db: Session = Depends(get_db)):
    db_package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")
    for field, value in package.model_dump().items():
        setattr(db_package, field, value)
    db.commit()
    db.refresh(db_package)
    return db_package


@router.delete("/{package_id}", response_model=Dict[str, str])
async def delete_package(package_id: int, db: Session = Depends(get_db)):
    db_package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")

    # Guardar el ID para el mensaje de éxito
    package_id = db_package.id

    # Eliminar el paquete
    db.delete(db_package)
    db.commit()

    # Devolver un mensaje en lugar del objeto eliminado
    return {"message": f"Package with ID {package_id} has been successfully deleted"}

@router.get("/by-sender/{client_id}", response_model=List[PackageSchema])
async def get_packages_by_sender(client_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los paquetes enviados por un cliente específico.

    Args:
        client_id: ID del cliente remitente
        db: Sesión de base de datos

    Returns:
        Lista de paquetes enviados por el cliente
    """
    packages = db.query(PackageModel).filter(PackageModel.sender_id == client_id).all()
    return packages

@router.get("/by-recipient/{client_id}", response_model=List[PackageSchema])
async def get_packages_by_recipient(client_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los paquetes recibidos por un cliente específico.

    Args:
        client_id: ID del cliente destinatario
        db: Sesión de base de datos

    Returns:
        Lista de paquetes recibidos por el cliente
    """
    packages = db.query(PackageModel).filter(PackageModel.recipient_id == client_id).all()
    return packages

@router.get("/by-trip/{trip_id}", response_model=List[PackageSchema])
async def get_packages_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los paquetes asociados a un viaje específico.

    Args:
        trip_id: ID del viaje
        db: Sesión de base de datos

    Returns:
        Lista de paquetes asociados al viaje
    """
    packages = db.query(PackageModel).filter(PackageModel.trip_id == trip_id).all()
    return packages
