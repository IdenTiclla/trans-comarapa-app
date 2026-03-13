"""
Bus service - contains all bus business logic.

Extracted from routes/bus.py following the SRP pattern from package_service.py.
"""

import logging
from typing import List

from sqlalchemy.orm import Session

from core.exceptions import NotFoundException, ConflictException, ValidationException
from models.bus import Bus as BusModel
from models.seat import Seat as SeatModel
from models.ticket import Ticket as TicketModel
from models.trip import Trip as TripModel
from repositories.bus_repository import BusRepository
from schemas.bus import BusCreate, BusWithSeatsCreate, SeatLayoutItem

logger = logging.getLogger(__name__)


class BusService:
    """Business logic for bus operations."""

    def __init__(
        self,
        db: Session,
        repo: BusRepository | None = None,
    ):
        self.db = db
        self.repo = repo or BusRepository(db)

    # ── Read operations ──────────────────────────────────────────────────

    def get_all(self) -> List[BusModel]:
        """Get all buses."""
        return self.repo.get_all(limit=1000)

    def get_by_id(self, bus_id: int) -> BusModel:
        """Get a bus by ID, raising NotFoundException if not found."""
        return self.repo.get_by_id_or_raise(bus_id, "Bus")

    # ── Validation ───────────────────────────────────────────────────────

    def _validate_seat_layout(self, seats: List[SeatLayoutItem], floors: int) -> None:
        """
        Validate seat layout constraints:
        - Seat numbers must be unique
        - Positions must be unique per deck
        - Second-deck seats require floors == 2
        """
        seat_numbers = [seat.seat_number for seat in seats]
        if len(seat_numbers) != len(set(seat_numbers)):
            raise ValidationException("Seat numbers must be unique.")

        positions_first: set = set()
        positions_second: set = set()
        for seat in seats:
            position = (seat.row, seat.column)
            if seat.deck == "FIRST":
                if position in positions_first:
                    raise ValidationException(
                        f"Duplicate position ({seat.row}, {seat.column}) in FIRST deck."
                    )
                positions_first.add(position)
            else:
                if position in positions_second:
                    raise ValidationException(
                        f"Duplicate position ({seat.row}, {seat.column}) in SECOND deck."
                    )
                positions_second.add(position)

        has_second_deck = any(seat.deck == "SECOND" for seat in seats)
        if has_second_deck and floors != 2:
            raise ValidationException(
                "Bus must have 2 floors if seats are on SECOND deck."
            )

    def _check_license_plate_unique(
        self, license_plate: str, exclude_id: int = None
    ) -> None:
        """Raise ConflictException if license plate is already used."""
        query = self.db.query(BusModel).filter(BusModel.license_plate == license_plate)
        if exclude_id:
            query = query.filter(BusModel.id != exclude_id)
        if query.first():
            raise ConflictException("License plate is already taken.")

    # ── Create / Update / Delete ─────────────────────────────────────────

    def create_bus(self, data: BusCreate) -> BusModel:
        """Verify license plate uniqueness and create a new bus."""
        self._check_license_plate_unique(data.license_plate)
        new_bus = BusModel(
            license_plate=data.license_plate,
            capacity=data.capacity,
            model=data.model,
            brand=data.brand,
            color=data.color,
            floors=data.floors,
        )
        self.db.add(new_bus)
        self.db.commit()
        self.db.refresh(new_bus)
        logger.info("Bus created with license plate %s", data.license_plate)
        return new_bus

    def create_bus_with_seats(self, data: BusWithSeatsCreate) -> BusModel:
        """Validate seat layout and atomically create bus + seats."""
        self._check_license_plate_unique(data.license_plate)

        if len(data.seats) != data.capacity:
            raise ValidationException(
                f"Number of seats ({len(data.seats)}) must match capacity ({data.capacity})."
            )

        self._validate_seat_layout(data.seats, data.floors)

        new_bus = BusModel(
            license_plate=data.license_plate,
            capacity=data.capacity,
            model=data.model,
            brand=data.brand,
            color=data.color,
            floors=data.floors,
        )
        self.db.add(new_bus)
        self.db.flush()

        for seat in data.seats:
            self.db.add(
                SeatModel(
                    bus_id=new_bus.id,
                    seat_number=seat.seat_number,
                    deck=seat.deck,
                    row=seat.row,
                    column=seat.column,
                )
            )

        self.db.commit()
        self.db.refresh(new_bus)
        logger.info(
            "Bus with seats created: id=%d, capacity=%d", new_bus.id, new_bus.capacity
        )
        return new_bus

    def update_bus(self, bus_id: int, data: BusCreate) -> BusModel:
        """Update a bus's basic info."""
        bus_data = data.model_dump()
        bus_data["id"] = bus_id
        self.db.query(BusModel).filter(BusModel.id == bus_id).update(bus_data)
        self.db.commit()
        return bus_data  # type: ignore[return-value]  # Route already refreshes via response_model

    def update_bus_seats(
        self, bus_id: int, seats: List[SeatLayoutItem]
    ) -> List[SeatModel]:
        """Replace all seats of a bus with a new layout. Fails if any seats have tickets."""
        bus = self.get_by_id(bus_id)

        existing_seats = (
            self.db.query(SeatModel).filter(SeatModel.bus_id == bus_id).all()
        )
        for seat in existing_seats:
            if (
                self.db.query(TicketModel)
                .filter(TicketModel.seat_id == seat.id)
                .first()
            ):
                raise ValidationException(
                    f"Cannot update seats because seat {seat.seat_number} has associated tickets."
                )

        self._validate_seat_layout(seats, bus.floors)

        self.db.query(SeatModel).filter(SeatModel.bus_id == bus_id).delete()

        new_seats: List[SeatModel] = []
        for seat in seats:
            new_seat = SeatModel(
                bus_id=bus_id,
                seat_number=seat.seat_number,
                deck=seat.deck,
                row=seat.row,
                column=seat.column,
            )
            self.db.add(new_seat)
            new_seats.append(new_seat)

        bus.capacity = len(seats)
        self.db.commit()

        for seat in new_seats:
            self.db.refresh(seat)

        logger.info("Bus %d seats updated: %d new seats", bus_id, len(new_seats))
        return new_seats

    def delete_bus(self, bus_id: int) -> BusModel:
        """Delete a bus. Fails if it has trips or tickets associated."""
        bus = self.get_by_id(bus_id)

        if self.repo.has_trips(bus_id):
            raise ValidationException("Bus has trips and cannot be deleted.")

        if self.repo.has_tickets(bus_id):
            raise ValidationException(
                "Bus has tickets associated to its seats and cannot be deleted."
            )

        self.repo.delete_seats(bus_id)
        self.db.delete(bus)
        self.db.commit()
        logger.info("Bus %d deleted", bus_id)
        return bus
