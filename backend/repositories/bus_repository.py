from typing import Optional

from sqlalchemy.orm import Session

from models.bus import Bus
from models.seat import Seat
from models.ticket import Ticket
from repositories.base import BaseRepository


class BusRepository(BaseRepository[Bus]):
    def __init__(self, db: Session):
        super().__init__(Bus, db)

    def get_by_license_plate(self, license_plate: str) -> Optional[Bus]:
        return self.db.query(Bus).filter(Bus.license_plate == license_plate).first()

    def check_license_plate_exists(
        self, license_plate: str, exclude_id: Optional[int] = None
    ) -> bool:
        query = self.db.query(Bus).filter(Bus.license_plate == license_plate)
        if exclude_id:
            query = query.filter(Bus.id != exclude_id)
        return query.first() is not None

    def get_seats(self, bus_id: int) -> list[Seat]:
        return (
            self.db.query(Seat)
            .filter(Seat.bus_id == bus_id)
            .order_by(Seat.seat_number)
            .all()
        )

    def has_trips(self, bus_id: int) -> bool:
        from models.trip import Trip
        return self.db.query(Trip).filter(Trip.bus_id == bus_id).first() is not None

    def has_tickets(self, bus_id: int) -> bool:
        return (
            self.db.query(Ticket)
            .join(Seat, Ticket.seat_id == Seat.id)
            .filter(Seat.bus_id == bus_id)
            .first()
            is not None
        )

    def delete_seats(self, bus_id: int) -> None:
        self.db.query(Seat).filter(Seat.bus_id == bus_id).delete()
        self.db.flush()

    def seat_has_tickets(self, seat_id: int) -> bool:
        return (
            self.db.query(Ticket).filter(Ticket.seat_id == seat_id).first()
            is not None
        )

    def create_bus(self, bus: Bus) -> Bus:
        self.db.add(bus)
        self.db.flush()
        return bus

    def create_seat(self, seat: Seat) -> Seat:
        self.db.add(seat)
        self.db.flush()
        return seat

    def create_seats_bulk(self, seats: list[Seat]) -> list[Seat]:
        for seat in seats:
            self.db.add(seat)
        self.db.flush()
        return seats

    def update_bus_data(self, bus_id: int, data: dict) -> None:
        data_copy = dict(data)
        data_copy["id"] = bus_id
        self.db.query(Bus).filter(Bus.id == bus_id).update(data_copy)
        self.db.flush()

    def delete_bus(self, bus: Bus) -> None:
        self.db.delete(bus)
        self.db.flush()
