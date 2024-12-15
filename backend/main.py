from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import schemas, models
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get('/')
def index():
    return "hello world"



@app.post(
    '/passengers',
    tags=["Passengers"],
    response_model=schemas.Passenger,
    status_code=status.HTTP_201_CREATED,
    summary="Create a single passenger.",
    description="This endpoint is fo creating the passenger who will use the service."
)

def create_passenger(passenger: schemas.Passenger, db: Session = Depends(get_db)):
    new_passenger = models.Passenger(
        name=passenger.name,
        lastname=passenger.lastname,
        phone_number=passenger.phone_number,
        birth_date=passenger.birth_date
    )

    db.add(new_passenger)
    db.commit()
    db.refresh(new_passenger)
    return new_passenger

@app.get('/passengers',
    tags=["Passengers"],
    response_model=list[schemas.Passenger],
    status_code=status.HTTP_200_OK,
    summary="Get all the passengers.",
    description="Endpoint for getting all the passengers in database."
    
)
def get_all_passengers(db: Session = Depends(get_db)):
    passengers = db.query(models.Passenger).all()
    return passengers

@app.patch('/passengers/{passenger_id}'
    ,tags=["Passengers"],
    status_code=status.HTTP_200_OK,
    response_model=schemas.Passenger,
    summary="Patch a single passenger.",
    description="This endpoint is for patching the passengers information."
)
def patch_specific_passenger(passenger_id: int, passenger: schemas.PatchPassenger, db: Session = Depends(get_db)):
    passenger_db = db.query(models.Passenger).filter(models.Passenger.id == passenger_id).first()
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

@app.get('/passengers/{passenger_id}',
    tags=["Passengers"],
    response_model=schemas.Passenger,
    status_code=status.HTTP_200_OK,
    summary="Get a specific passenger by using id.",
    description="Get a specific passenger by using id."
)
def get_specific_passenger(passenger_id: int, db: Session = Depends(get_db)):
    passenger_db = db.query(models.Passenger).filter(models.Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
    
    return passenger_db

@app.delete('/passengers/{passenger_id}',
    tags=["Passengers"],
    response_model=schemas.Passenger, 
    status_code=status.HTTP_200_OK,
    summary="Delete a specific passenger.",
    description="Enpoint for deleting specific passenger by using the id of the passenger."
)
def delete_specific_passenger(passenger_id: int, db: Session = Depends(get_db)):
    passenger_db = db.query(models.Passenger).filter(models.Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
        
    db.delete(passenger_db)
    db.commit()
    return passenger_db


@app.post('/drivers', tags=["Drivers"])
def create_driver(driver: schemas.Driver, db: Session = Depends(get_db)) -> schemas.Driver:
    existing_driver = db.query(models.Driver).filter(models.Driver.license_number == driver.license_number).first()
    if existing_driver:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License number already exists."
        )
    
    new_driver = models.Driver(
        name=driver.name,
        lastname=driver.lastname,
        phone_number=driver.phone_number,
        birth_date=driver.birth_date,
        license_number =driver.license_number,
        experience_years=driver.experience_years
    )

    db.add(new_driver)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurrred while creating the driver."
        )
    
    db.refresh(new_driver)
    return new_driver

@app.get('/drivers', tags=["Drivers"])
def get_all_drivers(db: Session = Depends(get_db)) -> list[schemas.Driver]:
    drivers = db.query(models.Driver).all()
    return drivers

@app.get('/drivers/{driver_id}', tags=["Drivers"])
def get_specific_driver(driver_id: int, db: Session = Depends(get_db)) -> schemas.Driver:
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    return driver

@app.patch('/drivers/{driver_id}', tags=["Drivers"])
def patch_specific_driver(driver: schemas.PatchDriver, driver_id: int, db: Session = Depends(get_db)) -> schemas.Driver:
    driver_db = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    driver_with_license = db.query(models.Driver).filter(models.Driver.license_number == driver.license_number).first()
    
    if driver_with_license and driver_db != driver_with_license:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License number already exists."
        )
    if not driver_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    
    update_data = driver.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter some driver's information."
        )

    for field, value in update_data.items():
        setattr(driver_db, field, value)

    db.commit()
    db.refresh(driver_db)

    return driver_db


@app.delete('/drivers/{driver_id}', tags=["Drivers"])
def delete_specific_driver(driver_id: int, db: Session = Depends(get_db)) -> schemas.Driver:
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    db.delete(driver)
    db.commit()
    return driver

@app.get('/buses',
    tags=['buses'],
    response_model=list[schemas.Bus],
    status_code=status.HTTP_200_OK,
    summary="Get all Buses.",
    description="This endpoint is used to see all buses infomation."
)
def get_all_busses(db: Session = Depends(get_db)):
    buses = db.query(models.Bus).all()
    return buses

@app.post('/buses',
    tags=['buses'],
    response_model=schemas.Bus,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bus.",
    description="This endpoint is used for creating a new bus."
)
def create_new_bus(bus: schemas.Bus, db: Session = Depends(get_db)):
    bus_with_existing_license_plate = db.query(models.Bus).filter(models.Bus.license_plate == bus.license_plate).first()
    if bus_with_existing_license_plate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License plate is already taken."
        )
    new_bus = models.Bus(
        license_plate=bus.license_plate,
        capacity=bus.capacity,
        model=bus.model
    )
    db.add(new_bus)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating a new Bus."
        )
    db.refresh(new_bus)
    return bus