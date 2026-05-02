import logging
from typing import List

from sqlalchemy.orm import Session

from core.exceptions import NotFoundException, ConflictException, ValidationException
from models.bus import Bus as BusModel
from models.seat import Seat as SeatModel
from repositories.bus_repository import BusRepository
from schemas.bus import BusCreate, BusWithSeatsCreate, SeatLayoutItem

logger = logging.getLogger(__name__)


class BusService:

    def __init__(
        self,
        db: Session,
        repo: BusRepository | None = None,
    ):
        self.db = db
        self.repo = repo or BusRepository(db)

    def get_all(self) -> List[BusModel]:
        return self.repo.get_all(limit=1000)

    def get_by_id(self, bus_id: int) -> BusModel:
        return self.repo.get_by_id_or_raise(bus_id, "Bus")

    def _validate_seat_layout(self, seats: List[SeatLayoutItem], floors: int) -> None:
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
        if self.repo.check_license_plate_exists(license_plate, exclude_id):
            raise ConflictException("License plate is already taken.")

    def create_bus(self, data: BusCreate) -> BusModel:
        self._check_license_plate_unique(data.license_plate)
        new_bus = BusModel(
            license_plate=data.license_plate,
            capacity=data.capacity,
            model=data.model,
            brand=data.brand,
            color=data.color,
            floors=data.floors,
            owner_id=data.owner_id,
        )
        self.repo.create_bus(new_bus)
        self.db.commit()
        self.db.refresh(new_bus)
        logger.info("Bus created with license plate %s", data.license_plate)
        return new_bus

    def create_bus_with_seats(self, data: BusWithSeatsCreate) -> BusModel:
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
            owner_id=data.owner_id,
        )
        self.repo.create_bus(new_bus)

        seats = [
            SeatModel(
                bus_id=new_bus.id,
                seat_number=seat.seat_number,
                deck=seat.deck,
                row=seat.row,
                column=seat.column,
            )
            for seat in data.seats
        ]
        self.repo.create_seats_bulk(seats)

        self.db.commit()
        self.db.refresh(new_bus)
        logger.info(
            "Bus with seats created: id=%d, capacity=%d", new_bus.id, new_bus.capacity
        )
        return new_bus

    def update_bus(self, bus_id: int, data: BusCreate) -> BusModel:
        bus_data = data.model_dump()
        self.repo.update_bus_data(bus_id, bus_data)
        self.db.commit()
        return bus_data

    def update_bus_seats(
        self, bus_id: int, seats: List[SeatLayoutItem]
    ) -> List[SeatModel]:
        bus = self.get_by_id(bus_id)

        existing_seats = self.repo.get_seats(bus_id)
        for seat in existing_seats:
            if self.repo.seat_has_tickets(seat.id):
                raise ValidationException(
                    f"Cannot update seats because seat {seat.seat_number} has associated tickets."
                )

        self._validate_seat_layout(seats, bus.floors)

        self.repo.delete_seats(bus_id)

        new_seats: List[SeatModel] = []
        for seat in seats:
            new_seat = SeatModel(
                bus_id=bus_id,
                seat_number=seat.seat_number,
                deck=seat.deck,
                row=seat.row,
                column=seat.column,
            )
            new_seats.append(new_seat)

        self.repo.create_seats_bulk(new_seats)

        bus.capacity = len(seats)
        self.db.commit()

        for seat in new_seats:
            self.db.refresh(seat)

        logger.info("Bus %d seats updated: %d new seats", bus_id, len(new_seats))
        return new_seats

    def delete_bus(self, bus_id: int) -> BusModel:
        bus = self.get_by_id(bus_id)

        if self.repo.has_trips(bus_id):
            raise ValidationException("Bus has trips and cannot be deleted.")

        if self.repo.has_tickets(bus_id):
            raise ValidationException(
                "Bus has tickets associated to its seats and cannot be deleted."
            )

        self.repo.delete_seats(bus_id)
        self.repo.delete_bus(bus)
        self.db.commit()
        logger.info("Bus %d deleted", bus_id)
        return bus
