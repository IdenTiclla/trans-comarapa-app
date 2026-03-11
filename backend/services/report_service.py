"""
Report service - generates monthly reports for tickets, packages, and cash registers.
"""

import csv
import io
from datetime import datetime, date
from typing import Optional, Any, Dict, List
from calendar import monthrange

from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, case

from models.ticket import Ticket
from models.package import Package
from models.package_item import PackageItem
from models.cash_register import CashRegister
from models.cash_transaction import CashTransaction
from models.trip import Trip
from models.route import Route
from models.location import Location
from models.secretary import Secretary
from core.enums import CashRegisterStatus


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def _date_range(self, year: int, month: int):
        _, last_day = monthrange(year, month)
        start = datetime(year, month, 1, 0, 0, 0)
        end = datetime(year, month, last_day, 23, 59, 59)
        return start, end

    def _office_filter_for_secretary(self, secretary_id: int):
        """Get office_id for a secretary to restrict reports."""
        sec = self.db.query(Secretary).filter(Secretary.id == secretary_id).first()
        return sec.office_id if sec else None

    def monthly_ticket_report(
        self, year: int, month: int, office_id: Optional[int] = None
    ) -> Dict[str, Any]:
        start, end = self._date_range(year, month)

        query = self.db.query(Ticket).filter(
            Ticket.created_at >= start,
            Ticket.created_at <= end,
            Ticket.state != "cancelled",
        )

        if office_id:
            sec_ids = [
                s.id for s in
                self.db.query(Secretary.id).filter(Secretary.office_id == office_id).all()
            ]
            if sec_ids:
                query = query.filter(Ticket.secretary_id.in_(sec_ids))
            else:
                query = query.filter(False)  # no secretaries → no results

        tickets = query.all()

        total_count = len(tickets)
        total_revenue = float(sum(t.price for t in tickets))

        # By payment method
        by_payment = {}
        for t in tickets:
            pm = t.payment_method or "unknown"
            if pm not in by_payment:
                by_payment[pm] = {"count": 0, "total": 0.0}
            by_payment[pm]["count"] += 1
            by_payment[pm]["total"] += float(t.price)

        # By route
        by_route = {}
        for t in tickets:
            trip = t.trip
            if trip and trip.route:
                origin = trip.route.origin_location.name if trip.route.origin_location else "?"
                dest = trip.route.destination_location.name if trip.route.destination_location else "?"
                key = f"{origin} → {dest}"
            else:
                key = "Sin ruta"
            if key not in by_route:
                by_route[key] = {"count": 0, "total": 0.0}
            by_route[key]["count"] += 1
            by_route[key]["total"] += float(t.price)

        # Detail rows for CSV
        rows = []
        for t in tickets:
            trip = t.trip
            route_name = ""
            if trip and trip.route:
                origin = trip.route.origin_location.name if trip.route.origin_location else "?"
                dest = trip.route.destination_location.name if trip.route.destination_location else "?"
                route_name = f"{origin} → {dest}"
            client_name = ""
            if t.client:
                client_name = f"{t.client.firstname or ''} {t.client.lastname or ''}".strip()
            rows.append({
                "id": t.id,
                "date": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else "",
                "client": client_name,
                "route": route_name,
                "state": t.state,
                "payment_method": t.payment_method,
                "price": float(t.price),
            })

        return {
            "year": year,
            "month": month,
            "total_count": total_count,
            "total_revenue": total_revenue,
            "by_payment_method": by_payment,
            "by_route": by_route,
            "rows": rows,
        }

    def monthly_package_report(
        self, year: int, month: int, office_id: Optional[int] = None
    ) -> Dict[str, Any]:
        start, end = self._date_range(year, month)

        query = self.db.query(Package).filter(
            Package.created_at >= start,
            Package.created_at <= end,
        )

        if office_id:
            sec_ids = [
                s.id for s in
                self.db.query(Secretary.id).filter(Secretary.office_id == office_id).all()
            ]
            if sec_ids:
                query = query.filter(Package.secretary_id.in_(sec_ids))
            else:
                query = query.filter(False)

        packages = query.all()

        total_count = len(packages)
        total_revenue = 0.0
        by_status = {}
        by_payment_status = {}

        rows = []
        for p in packages:
            amount = p.total_amount
            total_revenue += float(amount)

            st = p.status or "unknown"
            if st not in by_status:
                by_status[st] = {"count": 0, "total": 0.0}
            by_status[st]["count"] += 1
            by_status[st]["total"] += float(amount)

            ps = p.payment_status or "unknown"
            if ps not in by_payment_status:
                by_payment_status[ps] = {"count": 0, "total": 0.0}
            by_payment_status[ps]["count"] += 1
            by_payment_status[ps]["total"] += float(amount)

            sender_name = ""
            if p.sender:
                sender_name = f"{p.sender.firstname or ''} {p.sender.lastname or ''}".strip()
            recipient_name = ""
            if p.recipient:
                recipient_name = f"{p.recipient.firstname or ''} {p.recipient.lastname or ''}".strip()

            rows.append({
                "id": p.id,
                "tracking_number": p.tracking_number,
                "date": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
                "sender": sender_name,
                "recipient": recipient_name,
                "status": p.status,
                "payment_status": p.payment_status,
                "items_count": p.total_items_count,
                "amount": float(amount),
            })

        return {
            "year": year,
            "month": month,
            "total_count": total_count,
            "total_revenue": total_revenue,
            "by_status": by_status,
            "by_payment_status": by_payment_status,
            "rows": rows,
        }

    def monthly_cash_report(
        self, year: int, month: int, office_id: Optional[int] = None
    ) -> Dict[str, Any]:
        start, end = self._date_range(year, month)

        query = self.db.query(CashRegister).filter(
            CashRegister.opened_at >= start,
            CashRegister.opened_at <= end,
        )
        if office_id:
            query = query.filter(CashRegister.office_id == office_id)

        registers = query.order_by(CashRegister.opened_at).all()

        total_income = 0.0
        total_withdrawals = 0.0
        by_transaction_type = {}

        rows = []
        for reg in registers:
            reg_income = 0.0
            reg_withdrawals = 0.0
            for tx in reg.transactions:
                amount = float(tx.amount)
                tx_type = tx.type.value if hasattr(tx.type, 'value') else str(tx.type)
                if tx_type == "withdrawal":
                    reg_withdrawals += amount
                    total_withdrawals += amount
                else:
                    reg_income += amount
                    total_income += amount

                if tx_type not in by_transaction_type:
                    by_transaction_type[tx_type] = {"count": 0, "total": 0.0}
                by_transaction_type[tx_type]["count"] += 1
                by_transaction_type[tx_type]["total"] += amount

            status_val = reg.status.value if hasattr(reg.status, 'value') else str(reg.status)
            rows.append({
                "id": reg.id,
                "date": reg.date.isoformat() if reg.date else "",
                "opened_at": reg.opened_at.strftime("%Y-%m-%d %H:%M") if reg.opened_at else "",
                "closed_at": reg.closed_at.strftime("%Y-%m-%d %H:%M") if reg.closed_at else "",
                "status": status_val,
                "initial_balance": float(reg.initial_balance or 0),
                "final_balance": float(reg.final_balance or 0),
                "income": reg_income,
                "withdrawals": reg_withdrawals,
                "transaction_count": len(reg.transactions),
            })

        return {
            "year": year,
            "month": month,
            "total_registers": len(registers),
            "total_income": total_income,
            "total_withdrawals": total_withdrawals,
            "net": total_income - total_withdrawals,
            "by_transaction_type": by_transaction_type,
            "rows": rows,
        }

    # --- CSV generators ---

    def ticket_report_csv(self, year: int, month: int, office_id: Optional[int] = None) -> str:
        report = self.monthly_ticket_report(year, month, office_id)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Fecha", "Cliente", "Ruta", "Estado", "Método de Pago", "Precio (Bs)"])
        for r in report["rows"]:
            writer.writerow([r["id"], r["date"], r["client"], r["route"], r["state"], r["payment_method"], r["price"]])
        writer.writerow([])
        writer.writerow(["Total boletos", report["total_count"]])
        writer.writerow(["Ingresos totales (Bs)", report["total_revenue"]])
        return output.getvalue()

    def package_report_csv(self, year: int, month: int, office_id: Optional[int] = None) -> str:
        report = self.monthly_package_report(year, month, office_id)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "N° Seguimiento", "Fecha", "Remitente", "Destinatario", "Estado", "Estado Pago", "Items", "Monto (Bs)"])
        for r in report["rows"]:
            writer.writerow([r["id"], r["tracking_number"], r["date"], r["sender"], r["recipient"], r["status"], r["payment_status"], r["items_count"], r["amount"]])
        writer.writerow([])
        writer.writerow(["Total encomiendas", report["total_count"]])
        writer.writerow(["Ingresos totales (Bs)", report["total_revenue"]])
        return output.getvalue()

    def cash_report_csv(self, year: int, month: int, office_id: Optional[int] = None) -> str:
        report = self.monthly_cash_report(year, month, office_id)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Fecha", "Abierta", "Cerrada", "Estado", "Balance Inicial (Bs)", "Balance Final (Bs)", "Ingresos (Bs)", "Retiros (Bs)", "Transacciones"])
        for r in report["rows"]:
            writer.writerow([r["id"], r["date"], r["opened_at"], r["closed_at"], r["status"], r["initial_balance"], r["final_balance"], r["income"], r["withdrawals"], r["transaction_count"]])
        writer.writerow([])
        writer.writerow(["Total ingresos (Bs)", report["total_income"]])
        writer.writerow(["Total retiros (Bs)", report["total_withdrawals"]])
        writer.writerow(["Neto (Bs)", report["net"]])
        return output.getvalue()
