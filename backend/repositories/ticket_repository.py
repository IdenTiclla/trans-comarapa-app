from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.ticket import Ticket
from models.ticket_state_history import TicketStateHistory
from models.seat import Seat
from models.client import Client
from models.trip import Trip
from models.secretary import Secretary
from models.user import User
from models.cash_transaction import CashTransaction
from repositories.base import BaseRepository


class TicketRepository(BaseRepository[Ticket]):
    def __init__(self, db: Session):
        super().__init__(Ticket, db)

    def _with_eager_loading(self):
        return self.db.query(Ticket).options(
            joinedload(Ticket.state_history),
            joinedload(Ticket.client),
            joinedload(Ticket.seat),
            joinedload(Ticket.secretary),
            joinedload(Ticket.trip),
        )

    def get_by_id_eager(self, ticket_id: int) -> Optional[Ticket]:
        return self._with_eager_loading().filter(Ticket.id == ticket_id).first()

    def get_all_tickets(self) -> list[Ticket]:
        return self.db.query(Ticket).all()

    def get_by_trip(self, trip_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.trip_id == trip_id).all()

    def get_by_client(self, client_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.client_id == client_id).all()

    def get_by_seat(self, seat_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.seat_id == seat_id).all()

    def get_active_by_seat_and_trip(
        self, seat_id: int, trip_id: int, exclude_ticket_id: int | None = None
    ) -> Optional[Ticket]:
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
        query = self.db.query(Ticket).filter(
            Ticket.client_id == client_id,
            Ticket.trip_id == trip_id,
            Ticket.state.in_(["pending", "confirmed"]),
        )
        if exclude_ticket_id:
            query = query.filter(Ticket.id != exclude_ticket_id)
        return query.first()

    def count_occupied_seats(self, trip_id: int) -> int:
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
        entry = TicketStateHistory(
            ticket_id=ticket_id,
            old_state=old_state,
            new_state=new_state,
            changed_by_user_id=changed_by_user_id,
        )
        self.db.add(entry)
        self.db.flush()
        return entry

    def search(self, term: str, limit: int = 20) -> list[Ticket]:
        from sqlalchemy import or_

        term_lower = f"%{term.lower()}%"
        try:
            ticket_id = int(term)
        except ValueError:
            ticket_id = None

        query = (
            self.db.query(Ticket)
            .join(Client, Client.id == Ticket.client_id, isouter=True)
            .filter(
                or_(
                    Ticket.id == ticket_id if ticket_id else False,
                    Client.firstname.ilike(term_lower),
                    Client.lastname.ilike(term_lower),
                    Client.document_id.ilike(term_lower),
                )
            )
        )
        return query.limit(limit).all()

    def get_seat_by_id(self, seat_id: int) -> Optional[Seat]:
        return self.db.query(Seat).filter(Seat.id == seat_id).first()

    def get_client_by_id(self, client_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_trip_by_id(self, trip_id: int) -> Optional[Trip]:
        return self.db.query(Trip).filter(Trip.id == trip_id).first()

    def get_secretary_by_id(self, secretary_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()

    def get_secretary_by_user_id(self, user_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.user_id == user_id).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_ticket(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        self.db.flush()
        return ticket

    def delete_ticket(self, ticket: Ticket) -> None:
        self.db.delete(ticket)
        self.db.flush()

    def get_cash_transaction_by_reference(
        self, reference_type: str, reference_id: int
    ) -> Optional[CashTransaction]:
        return (
            self.db.query(CashTransaction)
            .filter(
                CashTransaction.reference_type == reference_type,
                CashTransaction.reference_id == reference_id,
            )
            .first()
        )

    def has_ticket_cash_transaction(self, ticket_id: int) -> bool:
        """Whether any cash transaction exists for this ticket."""
        return (
            self.db.query(CashTransaction.id)
            .filter(
                CashTransaction.reference_id == ticket_id,
                CashTransaction.reference_type.like("ticket%"),
            )
            .first()
            is not None
        )

    def get_cash_balance_for_ticket(self, ticket_id: int) -> float:
        """Sum of all cash transaction amounts tied to this ticket.

        Includes the original TICKET_SALE and any ADJUSTMENT (edit, refund,
        cancellation). Returns the net effective cash currently in registers
        for this ticket — used to compute correct reversals.
        """
        rows = (
            self.db.query(CashTransaction.amount)
            .filter(
                CashTransaction.reference_id == ticket_id,
                CashTransaction.reference_type.like("ticket%"),
            )
            .all()
        )
        return float(sum(r[0] for r in rows) or 0.0)

    def get_active_ticket_for_seat_change(
        self, trip_id: int, seat_id: int
    ) -> Optional[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.trip_id == trip_id,
                Ticket.seat_id == seat_id,
                Ticket.state.in_(["sold", "confirmed", "reserved"]),
            )
            .first()
        )

    def count_tickets_for_trip(self, trip_id: int) -> int:
        return self.db.query(Ticket).filter(Ticket.trip_id == trip_id).count()

    def get_non_cancelled_by_trip(self, trip_id: int) -> list[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(Ticket.trip_id == trip_id, Ticket.state != "cancelled")
            .all()
        )

    def count_non_cancelled_by_trip(self, trip_id: int) -> int:
        from sqlalchemy import func
        return (
            self.db.query(func.count(Ticket.id))
            .filter(Ticket.trip_id == trip_id, Ticket.state != "cancelled")
            .scalar()
            or 0
        )

    def get_active_by_trip(self, trip_id: int) -> list[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.trip_id == trip_id,
                Ticket.state.in_(["pending", "confirmed"]),
            )
            .all()
        )
