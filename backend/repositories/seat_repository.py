import logging
from sqlalchemy.orm import Session

from models.seat import Seat
from models.bus import Bus
from models.ticket import Ticket

logger = logging.getLogger(__name__)


class SeatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, seat_id: int) -> Seat | None:
        return self.db.query(Seat).filter(Seat.id == seat_id).first()

    def get_by_id_or_raise(self, seat_id: int) -> Seat:
        seat = self.get_by_id(seat_id)
        if not seat:
            from core.exceptions import NotFoundException
            raise NotFoundException(f"Seat with id {seat_id} not found")
        return seat

    def get_all(self) -> list[Seat]:
        return self.db.query(Seat).all()

    def get_by_bus(self, bus_id: int) -> list[Seat]:
        return self.db.query(Seat).filter(Seat.bus_id == bus_id).all()

    def get_by_trip(self, trip_id: int) -> list[Seat]:
        return (
            self.db.query(Seat)
            .join(Ticket, Ticket.seat_id == Seat.id)
            .filter(Ticket.trip_id == trip_id)
            .all()
        )

    def find_duplicate(self, bus_id: int, seat_number: int, deck: int | None, exclude_id: int | None = None) -> Seat | None:
        query = self.db.query(Seat).filter(
            Seat.bus_id == bus_id,
            Seat.seat_number == seat_number,
            Seat.deck == deck,
        )
        if exclude_id:
            query = query.filter(Seat.id != exclude_id)
        return query.first()

    def count_seats_for_bus(self, bus_id: int) -> int:
        return self.db.query(Seat).filter(Seat.bus_id == bus_id).count()

    def has_tickets(self, seat_id: int) -> bool:
        return self.db.query(Ticket).filter(Ticket.seat_id == seat_id).first() is not None

    def get_bus(self, bus_id: int) -> Bus | None:
        return self.db.query(Bus).filter(Bus.id == bus_id).first()

    def create(self, seat: Seat) -> Seat:
        self.db.add(seat)
        self.db.flush()
        return seat

    def delete(self, seat: Seat) -> None:
        self.db.delete(seat)
        self.db.flush()
