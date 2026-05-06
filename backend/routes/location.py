import logging

from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from db.session import get_db
from models.location import Location as LocationModel
from models.route import Route as RouteModel
from schemas.location import LocationCreate, Location as LocationSchema, LocationUpdate
from auth.jwt import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Locations"]
)

@router.post("", response_model=LocationSchema, status_code=status.HTTP_201_CREATED)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new location"""
    existing_location = db.query(LocationModel).filter(
        LocationModel.name == location.name
    ).first()
    if existing_location:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Location with this name already exists"
        )
    
    db_location = LocationModel(**location.model_dump())
    try:
        db.add(db_location)
        db.commit()
        db.refresh(db_location)
        return db_location
    except Exception as e:
        db.rollback()
        logger.error("Error creating location: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the location."
        )

@router.get("", response_model=List[LocationSchema])
def get_locations(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all locations with optional filtering
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **search**: Search in name and description
    - **city**: Filter by city
    - **state**: Filter by state
    """
    query = db.query(LocationModel)
    
    if search:
        query = query.filter(
            or_(
                LocationModel.name.ilike(f"%{search}%"),
                LocationModel.description.ilike(f"%{search}%")
            )
        )
    if city:
        query = query.filter(LocationModel.city == city)
    if state:
        query = query.filter(LocationModel.state == state)
    
    return query.offset(skip).limit(limit).all()

@router.get("/search-destinations", response_model=List[LocationSchema])
def search_destinations(
    search: str = Query(..., description="Search term for destination names"),
    origin_location_id: Optional[int] = Query(None, description="Filter by origin location ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search for destination locations, optionally filtered by origin location"""
    query = db.query(LocationModel)
    
    if origin_location_id:
        route_destinations = db.query(RouteModel.destination_location_id).filter(
            RouteModel.origin_location_id == origin_location_id
        ).subquery()
        
        query = query.filter(LocationModel.id.in_(route_destinations))
    
    if search.strip():
        query = query.filter(
            or_(
                LocationModel.name.ilike(f"%{search.strip()}%"),
                LocationModel.description.ilike(f"%{search.strip()}%")
            )
        )
    
    return query.limit(20).all()

@router.get("/{location_id}", response_model=LocationSchema)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific location by ID"""
    location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    return location

@router.patch("/{location_id}", response_model=LocationSchema)
def update_location(
    location_id: int,
    location_update: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a location"""
    db_location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )

    if location_update.name and location_update.name != db_location.name:
        existing_location = db.query(LocationModel).filter(
            LocationModel.name == location_update.name
        ).first()
        if existing_location:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Location with this name already exists"
            )

    update_data = location_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_location, field, value)

    try:
        db.commit()
        db.refresh(db_location)
        return db_location
    except Exception as e:
        db.rollback()
        logger.error("Error updating location: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the location."
        )

@router.delete("/{location_id}", response_model=LocationSchema)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a location"""
    location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    try:
        db.delete(location)
        db.commit()
        return location
    except Exception as e:
        db.rollback()
        logger.error("Error deleting location: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cannot delete location as it is being referenced by other records"
        )
