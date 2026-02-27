"""
Ticket service - contains all ticket business logic.

Extracted from routes/ticket.py to create a clean separation of concerns.
The route layer becomes a thin HTTP adapter that delegates to this service.
"""

import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
    ForbiddenException,
    UnauthorizedException,
)
from models.ticket import Ticket
from models.seat import Seat
from models.client import Client
from models.trip import Trip
from models.secretary import Secretary
from models.user import User
from repositories.ticket_repository import TicketRepository
from schemas.ticket import TicketCreate, TicketUpdate

logger = logging.getLogger(__name__)


class TicketService:
    """Business logic for ticket operations."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = TicketRepository(db)

    def get_all(self) -> list[Ticket]:
        """Get all tickets."""
        return self.db.query(Ticket).all()

    def get_by_id(self, ticket_id: int) -> Ticket:
        """Get a ticket by ID or raise NotFoundException."""
        return self.repo.get_by_id_or_raise(ticket_id, "Ticket")

    def get_by_trip(self, trip_id: int) -> list[Ticket]:
        """Get all tickets for a trip."""
        return self.repo.get_by_trip(trip_id)

    def get_by_client(self, client_id: int) -> list[Ticket]:
        """Get all tickets for a client."""
        return self.repo.get_by_client(client_id)

    def get_by_seat(self, seat_id: int) -> list[Ticket]:
        """Get all tickets for a seat."""
        return self.repo.get_by_seat(seat_id)

    def create_ticket(self, data: TicketCreate) -> Ticket:
        """Create a new ticket with full validation."""
        logger.debug("Creating ticket with data: %s", data)

        # 1. Verify seat exists
        seat = self.db.query(Seat).filter(Seat.id == data.seat_id).first()
        if not seat:
            raise NotFoundException(f"Seat with id {data.seat_id} not found")

        # 2. Verify client exists
        client = self.db.query(Client).filter(Client.id == data.client_id).first()
        if not client:
            raise NotFoundException(f"Client with id {data.client_id} not found")

        # 3. Verify trip exists
        trip = self.db.query(Trip).filter(Trip.id == data.trip_id).first()
        if not trip:
            raise NotFoundException(f"Trip with id {data.trip_id} not found")

        # 4. Resolve secretary
        actual_secretary_id = self._resolve_secretary(data.operator_user_id)

        # 5. Warn if trip already departed
        if trip.trip_datetime < datetime.now():
            logger.warning(
                "Creating ticket for departed trip (trip_datetime: %s)",
                trip.trip_datetime,
            )

        # 6. Verify seat belongs to trip's bus
        if seat.bus_id != trip.bus_id:
            raise ValidationException(
                f"Seat with id {data.seat_id} does not belong to the bus assigned to trip {data.trip_id}"
            )

        # 7. Verify seat not already booked
        existing = self.repo.get_active_by_seat_and_trip(data.seat_id, data.trip_id)
        if existing:
            raise ConflictException(
                f"Seat with id {data.seat_id} is already booked for trip {data.trip_id}"
            )

        # 8. Validate state
        valid_states = ["pending", "confirmed", "cancelled", "completed"]
        if data.state.lower() not in valid_states:
            raise ValidationException(
                f"Invalid ticket state: {data.state}. Valid states are: {', '.join(valid_states)}"
            )

        # Create ticket
        new_ticket = Ticket(
            state=data.state.lower(),
            seat_id=data.seat_id,
            client_id=data.client_id,
            trip_id=data.trip_id,
            destination=data.destination,
            secretary_id=actual_secretary_id,
            price=data.price,
            payment_method=data.payment_method.lower() if data.payment_method else None,
        )
        self.db.add(new_ticket)
        self.db.commit()
        self.db.refresh(new_ticket)

        # Log initial state
        self.repo.log_state_change(
            ticket_id=new_ticket.id,
            new_state=new_ticket.state,
            old_state=None,
            changed_by_user_id=data.operator_user_id,
        )
        self.db.commit()

        logger.debug("Ticket created successfully: %d", new_ticket.id)
        return new_ticket

    def update_ticket(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        """Update a ticket with validation."""
        db_ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")

        old_state = None
        if data.state and data.state.lower() != db_ticket.state:
            old_state = db_ticket.state

        # Validate trip-related constraints
        trip = self.db.query(Trip).filter(Trip.id == db_ticket.trip_id).first()
        if trip and trip.trip_datetime < datetime.now():
            if data.state and data.state.lower() not in ["completed", "cancelled"]:
                raise ValidationException(
                    "Trip has already departed. Ticket state can only be updated to 'completed' or 'cancelled'"
                )

        # Validate seat change
        if data.seat_id and data.seat_id != db_ticket.seat_id:
            seat = self.db.query(Seat).filter(Seat.id == data.seat_id).first()
            if not seat:
                raise NotFoundException(f"Seat with id {data.seat_id} not found")
            if seat.bus_id != trip.bus_id:
                raise ValidationException(
                    f"Seat with id {data.seat_id} does not belong to the bus assigned to trip {db_ticket.trip_id}"
                )
            existing = self.repo.get_active_by_seat_and_trip(
                data.seat_id, db_ticket.trip_id, exclude_ticket_id=ticket_id
            )
            if existing:
                raise ConflictException(
                    f"Seat with id {data.seat_id} is already booked for trip {db_ticket.trip_id}"
                )

        # Validate client change
        if data.client_id and data.client_id != db_ticket.client_id:
            client = self.db.query(Client).filter(Client.id == data.client_id).first()
            if not client:
                raise NotFoundException(f"Client with id {data.client_id} not found")
            existing = self.repo.get_active_by_client_and_trip(
                data.client_id, db_ticket.trip_id, exclude_ticket_id=ticket_id
            )
            if existing:
                raise ConflictException(
                    f"Client with id {data.client_id} already has a ticket for trip {db_ticket.trip_id}"
                )

        # Apply updates
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if "state" in update_data:
            update_data["state"] = update_data["state"].lower()

        for field, value in update_data.items():
            setattr(db_ticket, field, value)

        self.db.commit()
        self.db.refresh(db_ticket)

        # Log state change
        if old_state and db_ticket.state != old_state:
            self.repo.log_state_change(
                ticket_id=db_ticket.id,
                new_state=db_ticket.state,
                old_state=old_state,
            )
            self.db.commit()

        return db_ticket

    def delete_ticket(self, ticket_id: int) -> None:
        """Delete a ticket."""
        ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")
        self.db.delete(ticket)
        self.db.commit()

    def cancel_ticket(self, ticket_id: int) -> Ticket:
        """Cancel a ticket."""
        ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")

        if ticket.state == "cancelled":
            return ticket

        old_state = ticket.state
        ticket.state = "cancelled"
        self.db.commit()
        self.db.refresh(ticket)

        self.repo.log_state_change(
            ticket_id=ticket.id,
            new_state="cancelled",
            old_state=old_state,
        )
        self.db.commit()

        return ticket

    def change_seat(self, ticket_id: int, new_seat_id: int) -> Ticket:
        """Change seat assignment for a ticket."""
        ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")

        new_seat = self.db.query(Seat).filter(Seat.id == new_seat_id).first()
        if not new_seat:
            raise NotFoundException(f"Seat with id {new_seat_id} not found")

        trip = self.db.query(Trip).filter(Trip.id == ticket.trip_id).first()
        if not trip:
            raise NotFoundException(f"Trip with id {ticket.trip_id} not found")

        if new_seat.bus_id != trip.bus_id:
            raise ValidationException(
                "The new seat does not belong to the same bus as the trip"
            )

        existing = self.db.query(Ticket).filter(
            Ticket.trip_id == ticket.trip_id,
            Ticket.seat_id == new_seat_id,
            Ticket.state.in_(["sold", "confirmed", "reserved"]),
        ).first()
        if existing:
            raise ConflictException(
                f"Seat {new_seat.seat_number} is already occupied for this trip"
            )

        old_seat = self.db.query(Seat).filter(Seat.id == ticket.seat_id).first()
        old_seat_number = old_seat.seat_number if old_seat else "N/A"

        ticket.seat_id = new_seat_id
        self.db.commit()
        self.db.refresh(ticket)

        self.repo.log_state_change(
            ticket_id=ticket.id,
            new_state=f"seat_changed_to_{new_seat.seat_number}",
            old_state=f"seat_was_{old_seat_number}",
        )
        self.db.commit()

        return ticket

    def _resolve_secretary(self, operator_user_id: int) -> int:
        """Resolve the secretary_id from the operator's user_id."""
        secretary = (
            self.db.query(Secretary)
            .filter(Secretary.user_id == operator_user_id)
            .first()
        )
        if secretary:
            return secretary.id

        # Not a secretary - check if admin
        user = self.db.query(User).filter(User.id == operator_user_id).first()
        if not user:
            raise UnauthorizedException(
                "Usuario no válido. Su sesión ha expirado o su cuenta no existe. "
                "Por favor, inicie sesión nuevamente."
            )

        if "admin" in str(user.role).lower() or user.is_admin:
            default_secretary = self.db.query(Secretary).first()
            if default_secretary:
                return default_secretary.id
            raise ValidationException(
                "No secretaries available in the system. Cannot create ticket."
            )

        raise ForbiddenException(
            "Su usuario no tiene permisos para crear boletos. "
            "Solo secretarios y administradores pueden crear boletos."
        )
