from fastapi import APIRouter, status, Depends, HTTPException
from typing import List
from models.bus import Bus as BusModel
from schemas.bus import BusCreate, Bus as BusSchema, BusWithSeatsCreate, SeatLayoutItem
from sqlalchemy.orm import Session
from db.session import get_db
from models.seat import Seat as SeatModel
from schemas.seat import Seat as SeatSchema, SeatSimple
from models.ticket import Ticket as TicketModel
from schemas.ticket import Ticket as TicketSchema
from models.trip import Trip as TripModel
from schemas.trip import Trip as TripSchema
from models.client import Client as ClientModel
from schemas.client import Client as ClientSchema


router = APIRouter(
    tags=['Busses']
)


@router.get('',
    response_model=list[BusSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all Buses.",
    description="This endpoint is used to see all buses information."
)
def get_all_busses(db: Session = Depends(get_db)):
    buses = db.query(BusModel).all()
    return buses


@router.post('',
    response_model=BusSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bus.",
    description="This endpoint is used for creating a new bus."
)
def create_new_bus(bus: BusCreate, db: Session = Depends(get_db)):
    bus_with_existing_license_plate = db.query(BusModel).filter(BusModel.license_plate == bus.license_plate).first()
    if bus_with_existing_license_plate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License plate is already taken."
        )
    new_bus = BusModel(
        license_plate=bus.license_plate,
        capacity=bus.capacity,
        model=bus.model,
        brand=bus.brand,
        color=bus.color,
        floors=bus.floors
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
    return new_bus


@router.post('/with-seats',
    response_model=BusSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bus with seat layout.",
    description="This endpoint creates a bus with its complete seat layout atomically."
)
def create_bus_with_seats(bus_data: BusWithSeatsCreate, db: Session = Depends(get_db)):
    # Verify license plate is unique
    bus_with_existing_license_plate = db.query(BusModel).filter(
        BusModel.license_plate == bus_data.license_plate
    ).first()
    if bus_with_existing_license_plate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="License plate is already taken."
        )

    # Verify seats count matches capacity
    if len(bus_data.seats) != bus_data.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of seats ({len(bus_data.seats)}) must match capacity ({bus_data.capacity})."
        )

    # Verify seat_numbers are unique
    seat_numbers = [seat.seat_number for seat in bus_data.seats]
    if len(seat_numbers) != len(set(seat_numbers)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat numbers must be unique."
        )

    # Verify positions are unique per deck
    positions_first = set()
    positions_second = set()
    for seat in bus_data.seats:
        position = (seat.row, seat.column)
        if seat.deck == "FIRST":
            if position in positions_first:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate position ({seat.row}, {seat.column}) in FIRST deck."
                )
            positions_first.add(position)
        else:
            if position in positions_second:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate position ({seat.row}, {seat.column}) in SECOND deck."
                )
            positions_second.add(position)

    # Verify floors consistency
    has_second_deck = any(seat.deck == "SECOND" for seat in bus_data.seats)
    if has_second_deck and bus_data.floors != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus must have 2 floors if seats are on SECOND deck."
        )

    # Create bus
    new_bus = BusModel(
        license_plate=bus_data.license_plate,
        capacity=bus_data.capacity,
        model=bus_data.model,
        brand=bus_data.brand,
        color=bus_data.color,
        floors=bus_data.floors
    )
    db.add(new_bus)

    try:
        db.flush()  # Get the bus ID without committing

        # Create seats
        for seat in bus_data.seats:
            new_seat = SeatModel(
                bus_id=new_bus.id,
                seat_number=seat.seat_number,
                deck=seat.deck,
                row=seat.row,
                column=seat.column
            )
            db.add(new_seat)

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the bus with seats: {str(e)}"
        )

    db.refresh(new_bus)
    return new_bus


@router.delete('/{bus_id}',
    response_model=BusSchema,
    status_code=status.HTTP_200_OK,
    summary="Delete a bus.",
    description="This endpoint deletes a bus and its seats. Cannot delete if the bus has trips or tickets."
)
def delete_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )
    # Check if the bus has any trips
    if db.query(TripModel).filter(TripModel.bus_id == bus_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has trips and cannot be deleted."
        )
    # Check if any seat has tickets
    seat_with_ticket = (
        db.query(SeatModel)
        .join(TicketModel, TicketModel.seat_id == SeatModel.id)
        .filter(SeatModel.bus_id == bus_id)
        .first()
    )
    if seat_with_ticket:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus has tickets associated to its seats and cannot be deleted."
        )

    # Delete seats first (cascade), then bus
    db.query(SeatModel).filter(SeatModel.bus_id == bus_id).delete()
    db.delete(bus)
    db.commit()
    return bus


@router.get("/{bus_id}", response_model=BusSchema)
def get_single_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )
    return bus


@router.put("/{bus_id}", response_model=BusSchema)
def update_single_bus(bus_id: int, bus: BusCreate, db: Session = Depends(get_db)):
    bus_data = bus.model_dump()
    bus_data["id"] = bus_id
    db.query(BusModel).filter(BusModel.id == bus_id).update(bus_data)
    db.commit()
    return bus_data


@router.put("/{bus_id}/seats",
    response_model=List[SeatSimple],
    status_code=status.HTTP_200_OK,
    summary="Update bus seat layout.",
    description="This endpoint replaces all seats of a bus with a new layout. Cannot be used if tickets exist for the bus seats."
)
def update_bus_seats(bus_id: int, seats: List[SeatLayoutItem], db: Session = Depends(get_db)):
    # Verify bus exists
    bus = db.query(BusModel).filter(BusModel.id == bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found."
        )

    # Check if any seats have associated tickets
    existing_seats = db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
    for seat in existing_seats:
        if db.query(TicketModel).filter(TicketModel.seat_id == seat.id).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update seats because seat {seat.seat_number} has associated tickets."
            )

    # Verify seat_numbers are unique
    seat_numbers = [seat.seat_number for seat in seats]
    if len(seat_numbers) != len(set(seat_numbers)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat numbers must be unique."
        )

    # Verify positions are unique per deck
    positions_first = set()
    positions_second = set()
    for seat in seats:
        position = (seat.row, seat.column)
        if seat.deck == "FIRST":
            if position in positions_first:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate position ({seat.row}, {seat.column}) in FIRST deck."
                )
            positions_first.add(position)
        else:
            if position in positions_second:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate position ({seat.row}, {seat.column}) in SECOND deck."
                )
            positions_second.add(position)

    # Verify floors consistency
    has_second_deck = any(seat.deck == "SECOND" for seat in seats)
    if has_second_deck and bus.floors != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bus must have 2 floors to have seats on SECOND deck."
        )

    try:
        # Delete existing seats
        db.query(SeatModel).filter(SeatModel.bus_id == bus_id).delete()

        # Create new seats
        new_seats = []
        for seat in seats:
            new_seat = SeatModel(
                bus_id=bus_id,
                seat_number=seat.seat_number,
                deck=seat.deck,
                row=seat.row,
                column=seat.column
            )
            db.add(new_seat)
            new_seats.append(new_seat)

        # Update bus capacity
        bus.capacity = len(seats)

        db.commit()

        # Refresh to get IDs
        for seat in new_seats:
            db.refresh(seat)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating seats: {str(e)}"
        )

    return new_seats


@router.get("/{bus_id}/seats", response_model=list[SeatSchema])
def get_seats_by_bus(bus_id: int, db: Session = Depends(get_db)):
    seats = db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
    return seats


@router.get("/{bus_id}/tickets", response_model=list[TicketSchema])
def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    tickets = db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()
    return tickets


@router.get("/{bus_id}/trips", response_model=list[TripSchema])
def get_trips_by_bus(bus_id: int, db: Session = Depends(get_db)):
    trips = db.query(TripModel).filter(TripModel.bus_id == bus_id).all()
    return trips
