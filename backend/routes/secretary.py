from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.secretary import Secretary as SecretaryModel
from models.trip import Trip as TripModel
from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from schemas.secretary import SecretaryCreate, Secretary as SecretarySchema
from schemas.trip import Trip as TripSchema
from schemas.ticket import Ticket as TicketSchema
from typing import List, Dict



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
async def create_secretary(secretary: SecretaryCreate, db: Session = Depends(get_db)):
    # Validate if a secretary with the same email already exists
    existing_secretary = db.query(SecretaryModel).filter(SecretaryModel.email == secretary.email).first()
    if existing_secretary:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A secretary with this email already exists"
        )

    # Validate if the name is not empty
    if not secretary.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Secretary name cannot be empty"
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
            detail="An error occurred while creating the secretary"
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