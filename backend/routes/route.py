from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from db.session import get_db
from models.route import Route as RouteModel
from models.location import Location as LocationModel
from schemas.route import RouteCreate, Route as RouteSchema, RouteUpdate

router = APIRouter(
    tags=["Routes"]
)

@router.post("", response_model=RouteSchema, status_code=status.HTTP_201_CREATED)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """Create a new route between two locations"""
    # Verify that both locations exist
    origin = db.query(LocationModel).filter(LocationModel.id == route.origin_location_id).first()
    if not origin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Origin location with id {route.origin_location_id} not found"
        )
    
    destination = db.query(LocationModel).filter(LocationModel.id == route.destination_location_id).first()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination location with id {route.destination_location_id} not found"
        )

    # Check if route already exists
    existing_route = db.query(RouteModel).filter(
        RouteModel.origin_location_id == route.origin_location_id,
        RouteModel.destination_location_id == route.destination_location_id
    ).first()
    if existing_route:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Route between these locations already exists"
        )
    
    # Create new route
    db_route = RouteModel(**route.model_dump())
    try:
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        return db_route
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("", response_model=List[RouteSchema])
def get_routes(
    skip: int = 0,
    limit: int = 100,
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Get all routes with optional filtering
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **origin**: Filter by origin location name
    - **destination**: Filter by destination location name
    - **min_price**: Filter by minimum price
    - **max_price**: Filter by maximum price
    """
    query = db.query(RouteModel)

    if origin:
        query = query.join(LocationModel, RouteModel.origin_location_id == LocationModel.id)\
                    .filter(LocationModel.name.ilike(f"%{origin}%"))
    
    if destination:
        query = query.join(LocationModel, RouteModel.destination_location_id == LocationModel.id)\
                    .filter(LocationModel.name.ilike(f"%{destination}%"))
    
    if min_price is not None:
        query = query.filter(RouteModel.price >= min_price)
    
    if max_price is not None:
        query = query.filter(RouteModel.price <= max_price)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{route_id}", response_model=RouteSchema)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """Get a specific route by ID"""
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    return route

@router.patch("/{route_id}", response_model=RouteSchema)
def update_route(
    route_id: int,
    route_update: RouteUpdate,
    db: Session = Depends(get_db)
):
    """Update a route"""
    db_route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not db_route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )

    # If changing locations, verify they exist
    if route_update.origin_location_id is not None:
        origin = db.query(LocationModel).filter(LocationModel.id == route_update.origin_location_id).first()
        if not origin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Origin location with id {route_update.origin_location_id} not found"
            )
    
    if route_update.destination_location_id is not None:
        destination = db.query(LocationModel).filter(LocationModel.id == route_update.destination_location_id).first()
        if not destination:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Destination location with id {route_update.destination_location_id} not found"
            )

    # Check if updated route would create a duplicate
    if route_update.origin_location_id or route_update.destination_location_id:
        existing_route = db.query(RouteModel).filter(
            RouteModel.origin_location_id == (route_update.origin_location_id or db_route.origin_location_id),
            RouteModel.destination_location_id == (route_update.destination_location_id or db_route.destination_location_id),
            RouteModel.id != route_id
        ).first()
        if existing_route:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Route between these locations already exists"
            )

    update_data = route_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_route, field, value)

    try:
        db.commit()
        db.refresh(db_route)
        return db_route
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{route_id}", response_model=RouteSchema)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """Delete a route"""
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    try:
        db.delete(route)
        db.commit()
        return route
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cannot delete route as it is being referenced by other records"
        )