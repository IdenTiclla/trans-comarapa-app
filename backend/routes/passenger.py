from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from backend.schemas.passenger import PassengerCreate, PassengerPatch
from backend.models.passenger import Passenger
from backend.database import get_db

router = APIRouter(
    prefix='/passengers',
    tags=['Passengers']
)


@router.post(
    '/passengers',
    tags=["Passengers"],
    response_model=PassengerCreate,
    status_code=status.HTTP_201_CREATED,
    summary="Create a single passenger.",
    description="This endpoint is fo creating the passenger who will use the service."
)

def create_passenger(passenger: PassengerCreate, db: Session = Depends(get_db)):
    new_passenger = Passenger(
        name=passenger.name,
        lastname=passenger.lastname,
        phone_number=passenger.phone_number,
        birth_date=passenger.birth_date
    )

    db.add(new_passenger)
    db.commit()
    db.refresh(new_passenger)
    return new_passenger

@router.get('/passengers',
    tags=["Passengers"],
    response_model=list[PassengerCreate],
    status_code=status.HTTP_200_OK,
    summary="Get all the passengers.",
    description="Endpoint for getting all the passengers in database."
    
)
def get_all_passengers(db: Session = Depends(get_db)):
    passengers = db.query(Passenger).all()
    return passengers

@router.patch('/passengers/{passenger_id}'
    ,tags=["Passengers"],
    status_code=status.HTTP_200_OK,
    response_model=PassengerCreate,
    summary="Patch a single passenger.",
    description="This endpoint is for patching the passengers information."
)
def patch_specific_passenger(passenger_id: int, passenger: PassengerPatch, db: Session = Depends(get_db)):
    passenger_db = db.query(Passenger).filter(Passenger.id == passenger_id).first()
    if passenger_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )

    update_data = passenger.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Please enter some fields to update.'
        )
    for field, value in update_data.items():
        setattr(passenger_db, field, value)

    db.commit()
    db.refresh(passenger_db)
    return passenger_db

@router.get('/passengers/{passenger_id}',
    tags=["Passengers"],
    response_model=PassengerCreate,
    status_code=status.HTTP_200_OK,
    summary="Get a specific passenger by using id.",
    description="Get a specific passenger by using id."
)
def get_specific_passenger(passenger_id: int, db: Session = Depends(get_db)):
    passenger_db = db.query(Passenger).filter(Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
    
    return passenger_db

@router.delete('/passengers/{passenger_id}',
    tags=["Passengers"],
    response_model=PassengerCreate, 
    status_code=status.HTTP_200_OK,
    summary="Delete a specific passenger.",
    description="Enpoint for deleting specific passenger by using the id of the passenger."
)
def delete_specific_passenger(passenger_id: int, db: Session = Depends(get_db)):
    passenger_db = db.query(Passenger).filter(Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
        
    db.delete(passenger_db)
    db.commit()
    return passenger_db
