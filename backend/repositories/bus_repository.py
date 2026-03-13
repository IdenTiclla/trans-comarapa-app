"""Bus repository with domain-specific query methods."""

from typing import Optional

from sqlalchemy.orm import Session

from models.bus import Bus
from models.seat import Seat
from repositories.base import BaseRepository


class BusRepository(BaseRepository[Bus]):
    def __init__(self, db: Session):
        super().__init__(Bus, db)

    def get_by_license_plate(self, license_plate: str) -> Optional[Bus]:
        """Get a bus by license plate."""
        return self.db.query(Bus).filter(Bus.license_plate == license_plate).first()

    def get_seats(self, bus_id: int) -> list[Seat]:
        """Get all seats for a bus."""
        return (
            self.db.query(Seat)
            .filter(Seat.bus_id == bus_id)
            .order_by(Seat.seat_number)
            .all()
        )

    def has_trips(self, bus_id: int) -> bool:
        """Check if a bus has any trips assigned."""
        from models.trip import Trip

        return self.db.query(Trip).filter(Trip.bus_id == bus_id).first() is not None

    def has_tickets(self, bus_id: int) -> bool:
        """Check if any seat of this bus has tickets."""
        from models.ticket import Ticket

        return (
            self.db.query(Ticket)
            .join(Seat, Ticket.seat_id == Seat.id)
            .filter(Seat.bus_id == bus_id)
            .first()
            is not None
        )

    def delete_seats(self, bus_id: int) -> None:
        """Delete all seats for a bus."""
        self.db.query(Seat).filter(Seat.bus_id == bus_id).delete()
        self.db.flush()
