from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_
from models.trip import Trip as TripModel
from models.driver import Driver as DriverModel
from models.assistant import Assistant as AssistantModel
from models.bus import Bus as BusModel
from models.route import Route as RouteModel
from models.ticket import Ticket as TicketModel
from schemas.trip import TripCreate, Trip as TripSchema
from schemas.driver import Driver as DriverSchema
from db.session import get_db  # dependency to get a new session
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/trips", tags=["trips"])

@router.get("/", response_model=List[TripSchema])
async def get_trips(db: Session = Depends(get_db)):
    """
    Get all trips without applying future date validation
    """
    trips = db.query(TripModel).all()
    return trips

@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    """Create a new trip with comprehensive validation"""
    
    # 1. Validate trip date is in the future
    min_departure = datetime.now() + timedelta(minutes=30)
    if trip.trip_datetime < min_departure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trip datetime must be at least 30 minutes in the future. Current minimum: {min_departure}"
        )
    
    # 2. Verify that the driver exists
    driver = db.query(DriverModel).filter(DriverModel.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with id {trip.driver_id} not found"
        )
    
    # 3. Verify that the bus exists
    bus = db.query(BusModel).filter(BusModel.id == trip.bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus with id {trip.bus_id} not found"
        )
    
    # 4. Verify that the route exists
    route = db.query(RouteModel).filter(RouteModel.id == trip.route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route with id {trip.route_id} not found"
        )
    
    # 5. Check assistant if specified
    if trip.assistant_id:
        assistant = db.query(AssistantModel).filter(AssistantModel.id == trip.assistant_id).first()
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assistant with id {trip.assistant_id} not found"
            )
    
    # 6. Define time buffer for conflict detection (2 hours before and after)
    buffer_hours = 2
    trip_start = trip.trip_datetime - timedelta(hours=buffer_hours)
    trip_end = trip.trip_datetime + timedelta(hours=buffer_hours)
    
    # 7. Check for driver conflicts - driver shouldn't have another trip within the time buffer
    driver_conflict = db.query(TripModel).filter(
        TripModel.driver_id == trip.driver_id,
        TripModel.trip_datetime.between(trip_start, trip_end)
    ).first()
    
    if driver_conflict:
        conflict_time = driver_conflict.trip_datetime
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Driver with id {trip.driver_id} is already assigned to trip id {driver_conflict.id} at {conflict_time}"
        )
    
    # 8. Check for bus conflicts - bus shouldn't have another trip within the time buffer
    bus_conflict = db.query(TripModel).filter(
        TripModel.bus_id == trip.bus_id,
        TripModel.trip_datetime.between(trip_start, trip_end)
    ).first()
    
    if bus_conflict:
        conflict_time = bus_conflict.trip_datetime
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Bus with id {trip.bus_id} is already assigned to trip id {bus_conflict.id} at {conflict_time}"
        )
    
    # 9. Check for assistant conflicts if assistant is specified
    if trip.assistant_id:
        assistant_conflict = db.query(TripModel).filter(
            TripModel.assistant_id == trip.assistant_id,
            TripModel.trip_datetime.between(trip_start, trip_end)
        ).first()
        
        if assistant_conflict:
            conflict_time = assistant_conflict.trip_datetime
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Assistant with id {trip.assistant_id} is already assigned to trip id {assistant_conflict.id} at {conflict_time}"
            )
    
    # 10. Check for duplicate trips based on all properties
    duplicate_trip = db.query(TripModel).filter(
        TripModel.trip_datetime == trip.trip_datetime,
        TripModel.driver_id == trip.driver_id,
        TripModel.bus_id == trip.bus_id,
        TripModel.route_id == trip.route_id
    )
    
    # Conditionally add assistant check if an assistant is assigned
    if trip.assistant_id:
        duplicate_trip = duplicate_trip.filter(TripModel.assistant_id == trip.assistant_id)
    else:
        duplicate_trip = duplicate_trip.filter(TripModel.assistant_id == None)
    
    # Get the first result (if any)
    duplicate_trip = duplicate_trip.first()
    
    if duplicate_trip:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Trip already exists with id {duplicate_trip.id}"
        )
    
    # All validations passed - create the trip
    db_trip = TripModel(**trip.model_dump())
    try:
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Foreign key constraint failed: check driver and assistant IDs"
        ) from exc
    
    return db_trip

@router.get("/{trip_id}", response_model=TripSchema)
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get a trip by ID
    """
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )
    return trip

@router.get("/{trip_id}/driver", response_model=DriverSchema)
async def get_trip_driver(trip_id: int, db: Session = Depends(get_db)):
    """
    Get the driver assigned to a specific trip
    
    Args:
        trip_id: The ID of the trip
        db: Database session dependency
        
    Returns:
        DriverSchema: The driver details
        
    Raises:
        HTTPException: If trip or driver not found
    """
    db_trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not db_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )
    
    # Use the relationship directly since it's already loaded
    driver = db_trip.driver
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No driver assigned to trip {trip_id}"
        )
    
    return driver

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Delete a trip by ID
    """
    # First, check if trip exists
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )
    
    # Check if there are any tickets associated with this trip
    tickets = db.query(TicketModel).filter(TicketModel.trip_id == trip_id).all()
    
    if tickets:
        # If tickets exist, we cannot delete the trip
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete trip with id {trip_id} because it has {len(tickets)} associated tickets. Delete the tickets first."
        )
    
    # If no tickets, proceed with deletion
    db.delete(trip)
    db.commit()
    
    return {"message": "Trip deleted successfully", "status_code": status.HTTP_204_NO_CONTENT}
