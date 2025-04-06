from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from schemas.package import Package as PackageSchema, PackageCreate, PackageUpdate
from models.package import Package as PackageModel
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
    db_package = PackageModel(**package.model_dump())
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
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

@router.get("/sender/{client_id}", response_model=List[PackageSchema])
async def get_packages_by_sender(client_id: int, db: Session = Depends(get_db)):
    packages = db.query(PackageModel).filter(PackageModel.sender_id == client_id).all()
    if not packages:
        raise HTTPException(status_code=404, detail="No packages found for this sender")
    return packages

@router.get("/recipient/{client_id}", response_model=List[PackageSchema])
async def get_packages_by_recipient(client_id: int, db: Session = Depends(get_db)):
    packages = db.query(PackageModel).filter(PackageModel.recipient_id == client_id).all()
    if not packages:
        raise HTTPException(status_code=404, detail="No packages found for this recipient")
    return packages


@router.get("/trip/{trip_id}", response_model=List[PackageSchema])
async def get_packages_by_trip(trip_id: int, db: Session = Depends(get_db)):
    packages = db.query(PackageModel).filter(PackageModel.trip_id == trip_id).all()
    if not packages:
        raise HTTPException(status_code=404, detail="No packages found for this trip")
    return packages
