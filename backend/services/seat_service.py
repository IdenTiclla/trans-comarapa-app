import logging
from sqlalchemy.orm import Session

from repositories.seat_repository import SeatRepository
from models.seat import Seat
from core.exceptions import NotFoundException, ConflictException, ValidationException

logger = logging.getLogger(__name__)


class SeatService:
    def __init__(self, db: Session, repo: SeatRepository | None = None):
        self.db = db
        self.repo = repo or SeatRepository(db)

    def create(self, data: dict) -> Seat:
        bus = self.repo.get_bus(data["bus_id"])
        if not bus:
            raise NotFoundException(f"Bus with id {data['bus_id']} not found")
        if data.get("seat_number", 0) <= 0:
            raise ValidationException("Seat number must be a positive integer")
        existing = self.repo.find_duplicate(data["bus_id"], data["seat_number"], data.get("deck"))
        if existing:
            raise ConflictException(
                f"Seat number {data['seat_number']} on deck {data.get('deck')} already exists for bus {data['bus_id']}"
            )
        total_seats = self.repo.count_seats_for_bus(data["bus_id"])
        if total_seats >= bus.capacity:
            raise ValidationException(
                f"Bus with id {data['bus_id']} has reached its capacity of {bus.capacity} seats"
            )
        seat = Seat(bus_id=data["bus_id"], seat_number=data["seat_number"], deck=data.get("deck"))
        self.repo.create(seat)
        self.db.commit()
        self.db.refresh(seat)
        return seat

    def get_all(self) -> list[Seat]:
        return self.repo.get_all()

    def get_by_id(self, seat_id: int) -> Seat:
        return self.repo.get_by_id_or_raise(seat_id)

    def update(self, seat_id: int, update_data: dict) -> Seat:
        seat = self.repo.get_by_id_or_raise(seat_id)
        if self.repo.has_tickets(seat_id):
            raise ValidationException(
                f"Cannot update seat with id {seat_id} because it has associated tickets"
            )
        if update_data.get("bus_id"):
            bus = self.repo.get_bus(update_data["bus_id"])
            if not bus:
                raise NotFoundException(f"Bus with id {update_data['bus_id']} not found")
            if update_data["bus_id"] != seat.bus_id:
                total = self.repo.count_seats_for_bus(update_data["bus_id"])
                if total >= bus.capacity:
                    raise ValidationException(
                        f"Bus with id {update_data['bus_id']} has reached its capacity of {bus.capacity} seats"
                    )
        check_number = update_data.get("seat_number") or seat.seat_number
        check_deck = update_data.get("deck") if update_data.get("deck") is not None else seat.deck
        check_bus = update_data.get("bus_id") or seat.bus_id
        if (update_data.get("seat_number") and update_data["seat_number"] != seat.seat_number) or \
           (update_data.get("deck") is not None and update_data["deck"] != seat.deck):
            existing = self.repo.find_duplicate(check_bus, check_number, check_deck, exclude_id=seat_id)
            if existing:
                raise ConflictException(
                    f"Seat number {check_number} on deck {check_deck} already exists for bus {check_bus}"
                )
        for var, value in update_data.items():
            if value is not None:
                setattr(seat, var, value)
        self.db.commit()
        self.db.refresh(seat)
        return seat

    def delete(self, seat_id: int) -> None:
        seat = self.repo.get_by_id_or_raise(seat_id)
        if self.repo.has_tickets(seat_id):
            raise ValidationException(
                f"Cannot delete seat with id {seat_id} because it has associated tickets. Delete the tickets first."
            )
        self.repo.delete(seat)
        self.db.commit()

    def get_by_bus(self, bus_id: int) -> list[Seat]:
        return self.repo.get_by_bus(bus_id)

    def get_by_trip(self, trip_id: int) -> list[Seat]:
        return self.repo.get_by_trip(trip_id)
