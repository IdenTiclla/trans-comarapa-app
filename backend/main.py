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
