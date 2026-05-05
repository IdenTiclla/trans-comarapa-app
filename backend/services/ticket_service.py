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
from models.user import User
from repositories.ticket_repository import TicketRepository
from schemas.ticket import TicketCreate, TicketUpdate
from services.seat_lock_service import SeatLockService

logger = logging.getLogger(__name__)


class TicketService:

    def __init__(
        self,
        db: Session,
        repo: TicketRepository | None = None,
        lock_service: SeatLockService | None = None,
    ):
        self.db = db
        self.repo = repo or TicketRepository(db)
        self.lock_service = lock_service or SeatLockService()

    def get_all(self) -> list[Ticket]:
        return self.repo.get_all_tickets()

    def get_by_id(self, ticket_id: int) -> Ticket:
        ticket = self.repo.get_by_id_eager(ticket_id)
        if not ticket:
            raise NotFoundException(f"Ticket with id {ticket_id} not found")
        return ticket

    def get_by_trip(self, trip_id: int) -> list[Ticket]:
        return self.repo.get_by_trip(trip_id)

    def get_by_client(self, client_id: int) -> list[Ticket]:
        return self.repo.get_by_client(client_id)

    def get_by_seat(self, seat_id: int) -> list[Ticket]:
        return self.repo.get_by_seat(seat_id)

    def search(self, term: str, limit: int = 20) -> list[Ticket]:
        return self.repo.search(term, limit)

    def create_ticket(self, data: TicketCreate) -> Ticket:
        logger.debug("Creating ticket with data: %s", data)

        seat = self.repo.get_seat_by_id(data.seat_id)
        if not seat:
            raise NotFoundException(f"Seat with id {data.seat_id} not found")

        client = self.repo.get_client_by_id(data.client_id)
        if not client:
            raise NotFoundException(f"Client with id {data.client_id} not found")

        trip = self.repo.get_trip_by_id(data.trip_id)
        if not trip:
            raise NotFoundException(f"Trip with id {data.trip_id} not found")

        actual_secretary_id = self._resolve_secretary(data.operator_user_id)

        if trip.trip_datetime < datetime.now():
            logger.warning(
                "Creating ticket for departed trip (trip_datetime: %s)",
                trip.trip_datetime,
            )

        if seat.bus_id != trip.bus_id:
            raise ValidationException(
                f"Seat with id {data.seat_id} does not belong to the bus assigned to trip {data.trip_id}"
            )

        lock_holder = self.lock_service.get_lock_holder(data.trip_id, data.seat_id)
        if lock_holder is not None and lock_holder != data.operator_user_id:
            raise ConflictException(
                f"El asiento está temporalmente bloqueado por otro usuario."
            )

        existing = self.repo.get_active_by_seat_and_trip(data.seat_id, data.trip_id)
        if existing:
            raise ConflictException(
                f"Seat with id {data.seat_id} is already booked for trip {data.trip_id}"
            )

        valid_states = ["pending", "confirmed", "cancelled", "completed", "reserved"]
        if data.state.lower() not in valid_states:
            raise ValidationException(
                f"Invalid ticket state: {data.state}. Valid states are: {', '.join(valid_states)}"
            )

        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate
        from core.enums import CashTransactionType, PaymentMethod

        cash_service = CashRegisterService(self.db)
        secretary = self.repo.get_secretary_by_id(actual_secretary_id)

        office_id = secretary.office_id if secretary and secretary.office_id else 1
        if not office_id:
            raise ValidationException(
                "El usuario no tiene una oficina asignada para abrir caja."
            )

        current_register = cash_service.get_current_register(office_id)
        if not current_register:
            raise ValidationException(
                "No hay caja abierta para su oficina. Debe abrir caja antes de realizar ventas."
            )

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
        self.repo.create_ticket(new_ticket)
        self.db.commit()
        self.db.refresh(new_ticket)

        self.repo.log_state_change(
            ticket_id=new_ticket.id,
            new_state=new_ticket.state,
            old_state=None,
            changed_by_user_id=data.operator_user_id,
        )
        self.db.commit()

        if new_ticket.state in ["completed", "confirmed"] and new_ticket.price > 0:
            payment_enum = PaymentMethod.CASH
            if data.payment_method:
                try:
                    payment_enum = PaymentMethod(data.payment_method.lower())
                except ValueError:
                    payment_enum = PaymentMethod.CASH

            cash_service.record_transaction(
                CashTransactionCreate(
                    cash_register_id=current_register.id,
                    type=CashTransactionType.TICKET_SALE,
                    amount=new_ticket.price,
                    payment_method=payment_enum,
                    reference_id=new_ticket.id,
                    reference_type="ticket",
                    description=f"Venta de boleto {new_ticket.id} para viaje {data.trip_id}",
                )
            )

        self.lock_service.unlock_seat(data.trip_id, data.seat_id, data.operator_user_id)

        logger.debug("Ticket created successfully: %d", new_ticket.id)
        return new_ticket

    def update_ticket(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        db_ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")

        old_state = None
        if data.state and data.state.lower() != db_ticket.state:
            old_state = db_ticket.state

        trip = self.repo.get_trip_by_id(db_ticket.trip_id)
        if trip and trip.trip_datetime < datetime.now():
            if data.state and data.state.lower() not in ["completed", "cancelled"]:
                raise ValidationException(
                    "Trip has already departed. Ticket state can only be updated to 'completed' or 'cancelled'"
                )

        if data.seat_id and data.seat_id != db_ticket.seat_id:
            seat = self.repo.get_seat_by_id(data.seat_id)
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

        if data.client_id and data.client_id != db_ticket.client_id:
            client = self.repo.get_client_by_id(data.client_id)
            if not client:
                raise NotFoundException(f"Client with id {data.client_id} not found")
            existing = self.repo.get_active_by_client_and_trip(
                data.client_id, db_ticket.trip_id, exclude_ticket_id=ticket_id
            )
            if existing:
                raise ConflictException(
                    f"Client with id {data.client_id} already has a ticket for trip {db_ticket.trip_id}"
                )

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if "state" in update_data:
            update_data["state"] = update_data["state"].lower()

        for field, value in update_data.items():
            setattr(db_ticket, field, value)

        self.db.commit()
        self.db.refresh(db_ticket)

        if old_state and db_ticket.state != old_state:
            self.repo.log_state_change(
                ticket_id=db_ticket.id,
                new_state=db_ticket.state,
                old_state=old_state,
            )
            self.db.commit()

        if old_state == "pending" and db_ticket.state == "confirmed" and db_ticket.price and db_ticket.price > 0:
            self._record_confirmation_transaction(db_ticket)

        return db_ticket

    def _record_confirmation_transaction(self, ticket: Ticket) -> None:
        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate
        from core.enums import CashTransactionType, PaymentMethod

        secretary = self.repo.get_secretary_by_id(ticket.secretary_id)
        if not secretary or not secretary.office_id:
            return

        cash_service = CashRegisterService(self.db)
        current_register = cash_service.get_current_register(secretary.office_id)
        if not current_register:
            return

        payment_enum = PaymentMethod.CASH
        if ticket.payment_method:
            try:
                payment_enum = PaymentMethod(ticket.payment_method)
            except ValueError:
                payment_enum = PaymentMethod.CASH

        cash_service.record_transaction(
            CashTransactionCreate(
                cash_register_id=current_register.id,
                type=CashTransactionType.TICKET_SALE,
                amount=ticket.price,
                payment_method=payment_enum,
                reference_id=ticket.id,
                reference_type="ticket",
                description=f"Confirmación de reserva - boleto {ticket.id}",
            )
        )

    def delete_ticket(self, ticket_id: int) -> None:
        ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")
        self.repo.delete_ticket(ticket)
        self.db.commit()

    def cancel_ticket(self, ticket_id: int) -> Ticket:
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

        self._create_reversal_if_applicable(ticket)

        self.db.commit()
        return ticket

    def _create_reversal_if_applicable(self, ticket: Ticket) -> None:
        from core.enums import CashTransactionType, PaymentMethod
        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate

        original_tx = self.repo.get_cash_transaction_by_reference(
            "ticket", ticket.id
        )

        if not original_tx:
            return

        secretary = self.repo.get_secretary_by_id(ticket.secretary_id)
        if not secretary or not secretary.office_id:
            return

        cash_service = CashRegisterService(self.db)
        open_register = cash_service.get_current_register(secretary.office_id)

        if not open_register:
            return

        cash_service.record_transaction(
            CashTransactionCreate(
                cash_register_id=open_register.id,
                type=CashTransactionType.ADJUSTMENT,
                amount=-original_tx.amount,
                payment_method=PaymentMethod.CASH,
                reference_id=ticket.id,
                reference_type="ticket_cancellation",
                description=f"Reversión: cancelación boleto #{ticket.id}",
            )
        )

    def change_seat(self, ticket_id: int, new_seat_id: int) -> Ticket:
        ticket = self.repo.get_by_id_or_raise(ticket_id, "Ticket")

        new_seat = self.repo.get_seat_by_id(new_seat_id)
        if not new_seat:
            raise NotFoundException(f"Seat with id {new_seat_id} not found")

        trip = self.repo.get_trip_by_id(ticket.trip_id)
        if not trip:
            raise NotFoundException(f"Trip with id {ticket.trip_id} not found")

        if new_seat.bus_id != trip.bus_id:
            raise ValidationException(
                "The new seat does not belong to the same bus as the trip"
            )

        existing = self.repo.get_active_ticket_for_seat_change(
            ticket.trip_id, new_seat_id
        )
        if existing:
            raise ConflictException(
                f"Seat {new_seat.seat_number} is already occupied for this trip"
            )

        old_seat = self.repo.get_seat_by_id(ticket.seat_id)
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
        secretary = self.repo.get_secretary_by_user_id(operator_user_id)
        if secretary:
            return secretary.id

        user = self.repo.get_user_by_id(operator_user_id)
        if not user:
            raise UnauthorizedException(
                "Usuario no válido. Su sesión ha expirado o su cuenta no existe. "
                "Por favor, inicie sesión nuevamente."
            )

        if "admin" in str(user.role).lower() or user.is_admin:
            default_secretary = self.repo.get_by_id_or_raise(1, "Secretary") if self.repo.get_by_id(1) else None
            from repositories.person_repository import PersonRepository
            person_repo = PersonRepository(self.db)
            default_secretary = person_repo.get_any_secretary()
            if default_secretary:
                return default_secretary.id
            raise ValidationException(
                "No secretaries available in the system. Cannot create ticket."
            )

        raise ForbiddenException(
            "Su usuario no tiene permisos para crear boletos. "
            "Solo secretarios y administradores pueden crear boletos."
        )
