from fastapi import APIRouter, status, Depends, HTTPException
from backend.models.bus import Bus
from backend.schemas.bus import BusCreate
from sqlalchemy.orm import Session
from backend.database import get_db


router = APIRouter(
    prefix='/busses',
    tags=['Busses']
)
@router.get('/buses',
    tags=['Buses'],
    response_model=list[BusCreate],
    status_code=status.HTTP_200_OK,
    summary="Get all Buses.",
    description="This endpoint is used to see all buses infomation."
)
def get_all_busses(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    return buses

@router.post('/buses',
    tags=['Buses'],
    response_model=BusCreate,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bus.",
    description="This endpoint is used for creating a new bus."
)
def create_new_bus(bus: BusCreate, db: Session = Depends(get_db)):
    bus_with_existing_license_plate = db.query(Bus).filter(Bus.license_plate == bus.license_plate).first()
    if bus_with_existing_license_plate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License plate is already taken."
        )
    new_bus = Bus(
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

@router.delete('/buses/{bus_id}',
    response_model=BusCreate,
    tags=['Buses']
)
def delete_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )

    db.delete(bus)
    db.commit()
    return bus