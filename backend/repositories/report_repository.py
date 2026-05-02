from typing import Optional, List
from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.cash_register import CashRegister
from models.cash_transaction import CashTransaction
from models.office import Office
from models.ticket import Ticket
from models.package import Package
from models.secretary import Secretary
from core.enums import CashRegisterStatus, CashTransactionType


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_offices(self) -> List[Office]:
        return self.db.query(Office).all()

    def get_register_by_date(self, office_id: int, target_date: date) -> Optional[CashRegister]:
        return (
            self.db.query(CashRegister)
            .filter(
                CashRegister.office_id == office_id,
                CashRegister.date == target_date,
            )
            .first()
        )

    def get_registers_by_date(self, target_date: date) -> List[CashRegister]:
        return (
            self.db.query(CashRegister)
            .filter(CashRegister.date == target_date)
            .all()
        )

    def calculate_totals(self, register_id: int) -> tuple:
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
    ) -> List:
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

        return query.order_by(CashTransaction.created_at.desc()).all()

    def get_collections_by_office(self, target_date: date) -> List:
        return (
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
            .all()
        )

    def get_tickets_in_range(
        self,
        start,
        end,
        office_id: Optional[int] = None,
    ) -> List[Ticket]:
        query = self.db.query(Ticket).filter(
            Ticket.created_at >= start,
            Ticket.created_at <= end,
            Ticket.state != "cancelled",
        )
        if office_id:
            sec_ids = [
                s.id
                for s in self.db.query(Secretary.id)
                .filter(Secretary.office_id == office_id)
                .all()
            ]
            if sec_ids:
                query = query.filter(Ticket.secretary_id.in_(sec_ids))
            else:
                query = query.filter(False)
        return query.all()

    def get_packages_in_range(
        self,
        start,
        end,
        office_id: Optional[int] = None,
    ) -> List[Package]:
        query = self.db.query(Package).filter(
            Package.created_at >= start,
            Package.created_at <= end,
        )
        if office_id:
            sec_ids = [
                s.id
                for s in self.db.query(Secretary.id)
                .filter(Secretary.office_id == office_id)
                .all()
            ]
            if sec_ids:
                query = query.filter(Package.secretary_id.in_(sec_ids))
            else:
                query = query.filter(False)
        return query.all()

    def get_registers_in_range(
        self,
        start,
        end,
        office_id: Optional[int] = None,
    ) -> List[CashRegister]:
        query = self.db.query(CashRegister).filter(
            CashRegister.opened_at >= start,
            CashRegister.opened_at <= end,
        )
        if office_id:
            query = query.filter(CashRegister.office_id == office_id)
        return query.order_by(CashRegister.opened_at).all()

    def get_secretary_by_id(self, secretary_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()
