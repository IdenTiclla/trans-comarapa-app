from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.orm import Session

from repositories.report_repository import ReportRepository
from core.enums import CashRegisterStatus


class FinancialSummaryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReportRepository(db)

    def get_offices_financial_summary(self, target_date: Optional[date] = None):
        if target_date is None:
            target_date = date.today()

        offices = self.repo.get_all_offices()
        summaries = []
        totals = {"total_in": 0.0, "total_out": 0.0, "total_available": 0.0}

        for office in offices:
            register = self.repo.get_register_by_date(office.id, target_date)

            if register:
                total_in, total_out = self.repo.calculate_totals(register.id)
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

    def get_withdrawal_history(
        self,
        office_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> List[dict]:
        results = self.repo.get_withdrawal_history(office_id, date_from, date_to)

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

        registers = self.repo.get_registers_by_date(target_date)

        total_income = 0.0
        total_withdrawals = 0.0
        registers_open = 0
        total_available = 0.0

        for reg in registers:
            if reg.status == CashRegisterStatus.OPEN:
                registers_open += 1

            total_in, total_out = self.repo.calculate_totals(reg.id)
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

        results = []
        for row in self.repo.get_collections_by_office(target_date):
            results.append(
                {
                    "office_id": row.office_id,
                    "office_name": row.office_name,
                    "total_collected": float(row.total_collected or 0),
                    "transactions_count": row.transactions_count,
                }
            )

        return results
