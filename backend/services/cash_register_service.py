from datetime import date, datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session

from core.exceptions import NotFoundException, ValidationException, ConflictException
from core.enums import CashRegisterStatus, CashTransactionType, PaymentMethod
from schemas.cash_register import (
    CashRegisterCreate,
    CashTransactionCreate,
    CashRegisterHistoryItem,
    CashRegisterHistoryResponse,
)
from repositories.cash_register_repository import CashRegisterRepository
from repositories.office_repository import OfficeRepository
from models.cash_register import CashRegister
from models.user import User


class CashRegisterService:
    def __init__(self, db: Session):
        self.db = db
        self.cash_repo = CashRegisterRepository(db)
        self.office_repo = OfficeRepository(db)

    def _validate_office(self, office_id: int):
        office = self.office_repo.get_by_id(office_id)
        if not office:
            raise NotFoundException(f"Office with id {office_id} not found")
        return office

    def get_current_register(self, office_id: int):
        """Returns the currently open register for an office, or None if there isn't one."""
        self._validate_office(office_id)
        return self.cash_repo.get_open_register_by_office(office_id)

    def open_register(self, office_id: int, opened_by_id: int, initial_balance: float):
        """Opens a new cash register for the day."""
        self._validate_office(office_id)

        # Check if there is already an open register
        current = self.cash_repo.get_open_register_by_office(office_id)
        if current:
            raise ConflictException(
                f"Office {office_id} already has an open cash register (ID {current.id})"
            )

        today = date.today()
        # You could potentially allow multiple registers per day (one after another)
        # but let's just make sure there isn't an OPEN one, which we just checked.

        register_obj = CashRegister(
            **{
                "office_id": office_id,
                "date": today,
                "opened_by_id": opened_by_id,
                "initial_balance": initial_balance,
                "status": CashRegisterStatus.OPEN,
                "opened_at": datetime.now(),
            }
        )

        register = self.cash_repo.create(register_obj)
        self.db.commit()
        return register

    def close_register(self, register_id: int, closed_by_id: int, final_balance: float):
        """Closes an open cash register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")

        if register.status == CashRegisterStatus.CLOSED:
            raise ValidationException("Cash register is already closed")

        update_data = {
            "closed_by_id": closed_by_id,
            "final_balance": final_balance,
            "status": CashRegisterStatus.CLOSED,
            "closed_at": datetime.now(),
        }

        updated = self.cash_repo.update(register, update_data)
        self.db.commit()
        return updated

    def record_transaction(self, data: CashTransactionCreate):
        """Records a new cash transaction manually or automatically."""
        # Ensure register is valid and open
        register = self.cash_repo.get_by_id(data.cash_register_id)
        if not register:
            raise NotFoundException(f"Cash register {data.cash_register_id} not found")

        if register.status == CashRegisterStatus.CLOSED:
            raise ValidationException(
                "Cannot record transactions on a closed cash register"
            )

        transaction = self.cash_repo.create_transaction(data.model_dump())
        self.db.commit()
        return transaction

    def record_withdrawal(
        self, register_id: int, amount: float, description: str, user: User
    ):
        """Records a withdrawal from an open cash register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")

        if register.status == CashRegisterStatus.CLOSED:
            raise ValidationException("Cash register is not open")

        total_in, total_out = self.cash_repo.calculate_total_in_out(register_id)
        available_cash = register.initial_balance + total_in - total_out

        if amount > available_cash:
            raise ValidationException(
                f"Monto excede efectivo disponible (Bs. {available_cash:.2f})"
            )

        user_name = f"{user.firstname} {user.lastname}".strip() or user.username
        full_description = f"Retiro por {user_name}: {description}"

        transaction_data = {
            "cash_register_id": register_id,
            "type": CashTransactionType.WITHDRAWAL,
            "amount": amount,
            "payment_method": PaymentMethod.CASH,
            "description": full_description,
        }

        transaction = self.cash_repo.create_transaction(transaction_data)
        self.db.commit()
        return transaction

    def get_register_transactions(self, register_id: int):
        """Retrieves all transactions for a register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")
        return self.cash_repo.get_transactions(register_id)

    def get_daily_summary(self, register_id: int):
        """Calculates the summary for the given register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")

        total_in, total_out = self.cash_repo.calculate_total_in_out(register_id)
        expected_balance = register.initial_balance + total_in - total_out

        transactions = self.cash_repo.get_transactions(register_id)

        type_summary = {}
        method_summary = {}
        for t in transactions:
            t_type = t.type.value
            method = t.payment_method.value
            type_summary[t_type] = type_summary.get(t_type, 0.0) + t.amount
            method_summary[method] = method_summary.get(method, 0.0) + t.amount

        return {
            "office_id": register.office_id,
            "date": register.date,
            "initial_balance": register.initial_balance,
            "final_balance": register.final_balance,
            "total_in": total_in,
            "total_out": total_out,
            "expected_balance": expected_balance,
            "is_closed": register.status == CashRegisterStatus.CLOSED,
            "transactions_by_type": type_summary,
            "transactions_by_method": method_summary,
        }

    def get_register_history(
        self,
        office_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> CashRegisterHistoryResponse:
        """Gets closed cash register history with computed values."""
        if not date_from:
            date_from = date.today() - timedelta(days=7)
        if not date_to:
            date_to = date.today()

        registers = self.cash_repo.get_closed_registers(office_id, date_from, date_to)

        items = []
        for reg in registers:
            opened_by_name = (
                f"{reg.opened_by.firstname} {reg.opened_by.lastname}".strip()
                or reg.opened_by.username
            )
            closed_by_name = None
            if reg.closed_by:
                closed_by_name = (
                    f"{reg.closed_by.firstname} {reg.closed_by.lastname}".strip()
                    or reg.closed_by.username
                )

            total_in, total_out = self.cash_repo.calculate_total_in_out(reg.id)
            expected_balance = reg.initial_balance + total_in - total_out
            transaction_count = self.cash_repo.count_transactions(reg.id)

            difference = None
            if reg.final_balance is not None:
                difference = reg.final_balance - expected_balance

            items.append(
                CashRegisterHistoryItem(
                    id=reg.id,
                    date=reg.date,
                    opened_at=reg.opened_at,
                    closed_at=reg.closed_at,
                    opened_by_name=opened_by_name,
                    closed_by_name=closed_by_name,
                    initial_balance=reg.initial_balance,
                    final_balance=reg.final_balance,
                    transaction_count=transaction_count,
                    total_in=total_in,
                    total_out=total_out,
                    expected_balance=expected_balance,
                    difference=difference,
                )
            )

        return CashRegisterHistoryResponse(
            registers=items,
            total_count=len(items),
        )
