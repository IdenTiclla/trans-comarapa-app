"""
Ticket repository with domain-specific query methods.
"""

from typing import Optional

from sqlalchemy.orm import Session

from models.ticket import Ticket
from models.ticket_state_history import TicketStateHistory
from repositories.base import BaseRepository


class TicketRepository(BaseRepository[Ticket]):

    def __init__(self, db: Session):
        super().__init__(Ticket, db)

    def get_by_trip(self, trip_id: int) -> list[Ticket]:
        """Get all tickets for a given trip."""
        return self.db.query(Ticket).filter(Ticket.trip_id == trip_id).all()

    def get_by_client(self, client_id: int) -> list[Ticket]:
        """Get all tickets for a given client."""
        return self.db.query(Ticket).filter(Ticket.client_id == client_id).all()

    def get_by_seat(self, seat_id: int) -> list[Ticket]:
        """Get all tickets for a given seat."""
        return self.db.query(Ticket).filter(Ticket.seat_id == seat_id).all()

    def get_active_by_seat_and_trip(
        self, seat_id: int, trip_id: int, exclude_ticket_id: int | None = None
    ) -> Optional[Ticket]:
        """Find an active (pending/confirmed) ticket for a seat+trip combo."""
        query = self.db.query(Ticket).filter(
            Ticket.seat_id == seat_id,
            Ticket.trip_id == trip_id,
            Ticket.state.in_(["pending", "confirmed"]),
        )
        if exclude_ticket_id:
            query = query.filter(Ticket.id != exclude_ticket_id)
        return query.first()

    def get_active_by_client_and_trip(
        self, client_id: int, trip_id: int, exclude_ticket_id: int | None = None
    ) -> Optional[Ticket]:
        """Find an active ticket for a client+trip combo."""
        query = self.db.query(Ticket).filter(
            Ticket.client_id == client_id,
            Ticket.trip_id == trip_id,
            Ticket.state.in_(["pending", "confirmed"]),
        )
        if exclude_ticket_id:
            query = query.filter(Ticket.id != exclude_ticket_id)
        return query.first()

    def count_occupied_seats(self, trip_id: int) -> int:
        """Count the number of occupied (active) seats for a trip."""
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.trip_id == trip_id,
                Ticket.state.in_(["pending", "confirmed"]),
            )
            .count()
        )

    def log_state_change(
        self,
        ticket_id: int,
        new_state: str,
        old_state: Optional[str] = None,
        changed_by_user_id: Optional[int] = None,
    ) -> TicketStateHistory:
        """Create a ticket state history entry."""
        entry = TicketStateHistory(
            ticket_id=ticket_id,
            old_state=old_state,
            new_state=new_state,
            changed_by_user_id=changed_by_user_id,
        )
        self.db.add(entry)
        self.db.flush()
        return entry
