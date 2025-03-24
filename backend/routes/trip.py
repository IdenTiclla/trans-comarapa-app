from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.models.trip import Trip as TripModel
from backend.schemas.trip import TripCreate, Trip as TripSchema
from backend.db.session import get_db  # dependency to get a new session

router = APIRouter(prefix="/trips", tags=["trips"])

@router.get("/", response_model=list[TripSchema])
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(TripModel).all()
    return trips

@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    # Check for duplicate trip based on trip_datetime, driver_id, and assistant_id
    duplicate_trip = db.query(TripModel).filter(
        TripModel.trip_datetime == trip.trip_datetime,
        TripModel.driver_id == trip.driver_id,
        TripModel.assistant_id == trip.assistant_id,
        TripModel.bus_id == trip.bus_id,
        TripModel.route_id == trip.route_id
    ).first()
    if duplicate_trip:
        raise HTTPException(status_code=400, detail="Trip already exists")
    
    db_trip = TripModel(**trip.dict())
    try:
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Foreign key constraint failed: check driver and assistant IDs"
        ) from exc
    return db_trip
