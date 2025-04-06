from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from schemas.driver import DriverCreate, DriverPatch, Driver as DriverSchema
from models.driver import Driver
from db.session import get_db

router = APIRouter(
    tags=['Drivers']
)

@router.post('', tags=["Drivers"])
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)) -> DriverSchema:
    existing_driver = db.query(Driver).filter(Driver.license_number == driver.license_number).first()
    if existing_driver:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License number already exists."
        )
    new_driver = Driver(
        name=driver.name,
        lastname=driver.lastname,
        phone_number=driver.phone_number,
        birth_date=driver.birth_date,
        license_number=driver.license_number,
        experience_years=driver.experience_years
    )
    db.add(new_driver)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the driver."
        )
    db.refresh(new_driver)
    return new_driver

@router.get('', tags=["Drivers"])
def get_all_drivers(db: Session = Depends(get_db)) -> list[DriverSchema]:
    drivers = db.query(Driver).all()
    return drivers

@router.get('/{driver_id}', tags=["Drivers"])
def get_specific_driver(driver_id: int, db: Session = Depends(get_db)) -> DriverSchema:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    return driver

@router.patch('/{driver_id}', tags=["Drivers"])
def patch_specific_driver(driver: DriverPatch, driver_id: int, db: Session = Depends(get_db)) -> DriverSchema:
    driver_db = db.query(Driver).filter(Driver.id == driver_id).first()
    driver_with_license = db.query(Driver).filter(Driver.license_number == driver.license_number).first()
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

@router.delete('/{driver_id}', tags=["Drivers"])
def delete_specific_driver(driver_id: int, db: Session = Depends(get_db)) -> DriverSchema:
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found."
        )
    db.delete(driver)
    db.commit()
    return driver
