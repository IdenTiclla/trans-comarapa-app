from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from db.session import get_db
from models.route import Route as RouteModel
from models.route_schedule import RouteSchedule as RouteScheduleModel
from models.location import Location as LocationModel
from models.trip import Trip as TripModel
from models.user import User
from schemas.route import RouteCreate, Route as RouteSchema, RouteUpdate, RouteWithSchedules
from schemas.route_schedule import RouteScheduleCreate, RouteSchedule as RouteScheduleSchema, RouteScheduleUpdate
from schemas.trip import Trip as TripSchema
from auth.jwt import get_current_admin_user

router = APIRouter(
    tags=["Routes"]
)

@router.post("", response_model=RouteSchema, status_code=status.HTTP_201_CREATED)
def create_route(route: RouteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
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

@router.get("/with-schedules", response_model=List[RouteWithSchedules])
def get_routes_with_schedules(db: Session = Depends(get_db)):
    """Get all routes with their schedules"""
    routes = db.query(RouteModel).options(
        joinedload(RouteModel.schedules),
        joinedload(RouteModel.origin_location),
        joinedload(RouteModel.destination_location)
    ).all()
    return routes

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
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
def delete_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
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

@router.get("/{route_id}/schedules", response_model=List[RouteScheduleSchema])
def get_route_schedules(route_id: int, db: Session = Depends(get_db)):
    """Get all schedules for a route"""
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    schedules = db.query(RouteScheduleModel).filter(
        RouteScheduleModel.route_id == route_id
    ).order_by(RouteScheduleModel.departure_time).all()
    return schedules

@router.post("/{route_id}/schedules", response_model=RouteScheduleSchema, status_code=status.HTTP_201_CREATED)
def create_route_schedule(
    route_id: int,
    schedule: RouteScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Add a schedule to a route"""
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )

    existing = db.query(RouteScheduleModel).filter(
        RouteScheduleModel.route_id == route_id,
        RouteScheduleModel.departure_time == schedule.departure_time
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule with this departure time already exists for this route"
        )

    db_schedule = RouteScheduleModel(route_id=route_id, **schedule.model_dump())
    try:
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.patch("/{route_id}/schedules/{schedule_id}", response_model=RouteScheduleSchema)
def update_route_schedule(
    route_id: int,
    schedule_id: int,
    schedule_update: RouteScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a schedule"""
    db_schedule = db.query(RouteScheduleModel).filter(
        RouteScheduleModel.id == schedule_id,
        RouteScheduleModel.route_id == route_id
    ).first()
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    update_data = schedule_update.model_dump(exclude_unset=True)

    if "departure_time" in update_data and update_data["departure_time"] is not None:
        existing = db.query(RouteScheduleModel).filter(
            RouteScheduleModel.route_id == route_id,
            RouteScheduleModel.departure_time == update_data["departure_time"],
            RouteScheduleModel.id != schedule_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Schedule with this departure time already exists for this route"
            )

    for field, value in update_data.items():
        setattr(db_schedule, field, value)

    try:
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{route_id}/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route_schedule(
    route_id: int,
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a schedule"""
    db_schedule = db.query(RouteScheduleModel).filter(
        RouteScheduleModel.id == schedule_id,
        RouteScheduleModel.route_id == route_id
    ).first()
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    try:
        db.delete(db_schedule)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{route_id}/trips", response_model=List[TripSchema])
def get_trips_by_route(route_id: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los viajes asociados a una ruta específica.

    Args:
        route_id: ID de la ruta
        db: Sesión de base de datos

    Returns:
        Lista de viajes asociados a la ruta
    """
    # Verificar que la ruta existe
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route with id {route_id} not found"
        )

    # Obtener todos los viajes asociados a la ruta
    trips = db.query(TripModel).filter(TripModel.route_id == route_id).all()
    return trips
