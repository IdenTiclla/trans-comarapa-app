"""
Seat repository with domain-specific query methods.
"""

from typing import Optional

from sqlalchemy.orm import Session

from models.seat import Seat
from models.ticket import Ticket
from repositories.base import BaseRepository


class SeatRepository(BaseRepository[Seat]):

    def __init__(self, db: Session):
        super().__init__(Seat, db)

    def get_available_for_trip(self, trip_id: int, bus_id: int) -> list[Seat]:
        """Get seats for a bus that are not booked for the given trip."""
        # Get all seats for the bus
        all_seats = self.db.query(Seat).filter(Seat.bus_id == bus_id).all()

        # Get seat IDs that are occupied for this trip
        occupied_seat_ids = {
            t.seat_id
            for t in self.db.query(Ticket)
            .filter(
                Ticket.trip_id == trip_id,
                Ticket.state.in_(["pending", "confirmed"]),
            )
            .all()
        }

        return [s for s in all_seats if s.id not in occupied_seat_ids]

    def get_by_bus(self, bus_id: int) -> list[Seat]:
        """Get all seats for a specific bus."""
        return self.db.query(Seat).filter(Seat.bus_id == bus_id).all()
