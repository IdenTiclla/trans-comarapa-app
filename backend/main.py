from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import schemas, models
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get('/')
def index():
    return "hello world"



@app.post('/passengers')
def create_passenger(passenger: schemas.Passenger, db: Session = Depends(get_db)) -> schemas.Passenger:
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

@app.get('/passengers')
def get_all_passengers(db: Session = Depends(get_db)) -> list[schemas.Passenger]:
    passengers = db.query(models.Passenger).all()
    return passengers

@app.patch('/passengers/{passenger_id}')
def patch_specific_user(passenger_id: int, passenger: schemas.PatchPassenger, db: Session = Depends(get_db)) -> schemas.Passenger:
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

@app.get('/passengers/{passenger_id}')
def get_specific_passenger(passenger_id: int, db: Session = Depends(get_db)) -> schemas.Passenger:
    passenger_db = db.query(models.Passenger).filter(models.Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
    
    return passenger_db

@app.delete('/passengers/{passenger_id}')
def delete_specific_passenger(passenger_id: int, db: Session = Depends(get_db)) -> schemas.Passenger:
    passenger_db = db.query(models.Passenger).filter(models.Passenger.id == passenger_id).first()
    if not passenger_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passenger not found."
        )
        
    db.delete(passenger_db)
    db.commit()
    return passenger_db


@app.post('/drivers')
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

@app.get('/drivers')
def get_all_drivers(db: Session = Depends(get_db)) -> list[schemas.Driver]:
    drivers = db.query(models.Driver).all()
    return drivers