from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.cash_register import CashRegister
from models.cash_transaction import CashTransaction
from models.office import Office
from core.enums import CashRegisterStatus, CashTransactionType


class OfficeFinancialSummary:
    def __init__(
        self,
        office_id: int,
        office_name: str,
        status: str,
        initial_balance: float,
        total_in: float,
        total_out: float,
        available_cash: float,
    ):
        self.office_id = office_id
        self.office_name = office_name
        self.status = status
        self.initial_balance = initial_balance
        self.total_in = total_in
        self.total_out = total_out
        self.available_cash = available_cash


class WithdrawalRecord:
    def __init__(
        self,
        id: int,
        date: date,
        office_id: int,
        office_name: str,
        amount: float,
        description: str,
        registered_by: str,
        created_at: datetime,
    ):
        self.id = id
        self.date = date
        self.office_id = office_id
        self.office_name = office_name
        self.amount = amount
        self.description = description
        self.registered_by = registered_by
        self.created_at = created_at


class FinancialSummaryService:
    def __init__(self, db: Session):
        self.db = db

    def get_offices_financial_summary(self, target_date: Optional[date] = None):
        if target_date is None:
            target_date = date.today()

        offices = self.db.query(Office).all()
        summaries = []
        totals = {"total_in": 0.0, "total_out": 0.0, "total_available": 0.0}

        for office in offices:
            register = (
                self.db.query(CashRegister)
                .filter(
                    CashRegister.office_id == office.id,
                    CashRegister.date == target_date,
                )
                .first()
            )

            if register:
                total_in, total_out = self._calculate_totals(register.id)
                available_cash = register.initial_balance + total_in - total_out
                status = register.status.value

                summaries.append(
                    {
                        "office_id": office.id,
                        "office_name": office.name,
                        "status": status,
                        "initial_balance": register.initial_balance,
                        "total_in": total_in,
                        "total_out": total_out,
                        "available_cash": available_cash,
                    }
                )

                totals["total_in"] += total_in
                totals["total_out"] += total_out
                totals["total_available"] += available_cash
            else:
                summaries.append(
                    {
                        "office_id": office.id,
                        "office_name": office.name,
                        "status": "no_register",
                        "initial_balance": 0.0,
                        "total_in": 0.0,
                        "total_out": 0.0,
                        "available_cash": 0.0,
                    }
                )

        return {"offices": summaries, "totals": totals}

    def _calculate_totals(self, register_id: int) -> tuple:
        in_types = [
            CashTransactionType.TICKET_SALE,
            CashTransactionType.PACKAGE_PAYMENT,
            CashTransactionType.POR_COBRAR_COLLECTION,
        ]
        out_types = [CashTransactionType.WITHDRAWAL]

        total_in = (
            self.db.query(func.sum(CashTransaction.amount))
            .filter(
                CashTransaction.cash_register_id == register_id,
                CashTransaction.type.in_(in_types),
            )
            .scalar()
            or 0.0
        )

        total_out = (
            self.db.query(func.sum(CashTransaction.amount))
            .filter(
                CashTransaction.cash_register_id == register_id,
                CashTransaction.type.in_(out_types),
            )
            .scalar()
            or 0.0
        )

        adjustments = (
            self.db.query(func.sum(CashTransaction.amount))
            .filter(
                CashTransaction.cash_register_id == register_id,
                CashTransaction.type == CashTransactionType.ADJUSTMENT,
            )
            .scalar()
            or 0.0
        )

        if adjustments > 0:
            total_in += adjustments
        else:
            total_out += abs(adjustments)

        return float(total_in), float(total_out)

    def get_withdrawal_history(
        self,
        office_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> List[dict]:
        query = (
            self.db.query(
                CashTransaction.id,
                CashRegister.date,
                CashRegister.office_id,
                Office.name.label("office_name"),
                CashTransaction.amount,
                CashTransaction.description,
                CashTransaction.created_at,
            )
            .join(CashRegister, CashTransaction.cash_register_id == CashRegister.id)
            .join(Office, CashRegister.office_id == Office.id)
            .filter(CashTransaction.type == CashTransactionType.WITHDRAWAL)
        )

        if office_id:
            query = query.filter(CashRegister.office_id == office_id)

        if date_from:
            query = query.filter(CashRegister.date >= date_from)

        if date_to:
            query = query.filter(CashRegister.date <= date_to)

        results = query.order_by(CashTransaction.created_at.desc()).all()

        withdrawals = []
        for row in results:
            registered_by = ""
            if row.description:
                parts = row.description.split(":", 1)
                if len(parts) > 1:
                    registered_by = parts[0].replace("Retiro por ", "").strip()

            withdrawals.append(
                {
                    "id": row.id,
                    "date": row.date.isoformat() if row.date else None,
                    "office_id": row.office_id,
                    "office_name": row.office_name,
                    "amount": float(row.amount),
                    "description": row.description,
                    "registered_by": registered_by,
                    "created_at": row.created_at.isoformat()
                    if row.created_at
                    else None,
                }
            )

        return withdrawals

    def get_cash_summary(self, target_date: Optional[date] = None) -> dict:
        if target_date is None:
            target_date = date.today()

        registers = (
            self.db.query(CashRegister).filter(CashRegister.date == target_date).all()
        )

        total_income = 0.0
        total_withdrawals = 0.0
        registers_open = 0
        total_available = 0.0

        for reg in registers:
            if reg.status == CashRegisterStatus.OPEN:
                registers_open += 1

            total_in, total_out = self._calculate_totals(reg.id)
            total_income += total_in
            total_withdrawals += total_out
            total_available += reg.initial_balance + total_in - total_out

        return {
            "total_income_today": total_income,
            "total_withdrawals_today": total_withdrawals,
            "registers_open": registers_open,
            "total_available": total_available,
        }

    def get_collections_by_office(
        self, target_date: Optional[date] = None
    ) -> List[dict]:
        if target_date is None:
            target_date = date.today()

        query = (
            self.db.query(
                Office.id.label("office_id"),
                Office.name.label("office_name"),
                func.sum(CashTransaction.amount).label("total_collected"),
                func.count(CashTransaction.id).label("transactions_count"),
            )
            .join(CashRegister, CashRegister.office_id == Office.id)
            .join(CashTransaction, CashTransaction.cash_register_id == CashRegister.id)
            .filter(
                CashRegister.date == target_date,
                CashTransaction.type == CashTransactionType.POR_COBRAR_COLLECTION,
            )
            .group_by(Office.id, Office.name)
            .order_by(Office.name)
        )

        results = []
        for row in query.all():
            results.append(
                {
                    "office_id": row.office_id,
                    "office_name": row.office_name,
                    "total_collected": float(row.total_collected or 0),
                    "transactions_count": row.transactions_count,
                }
            )

        return results
