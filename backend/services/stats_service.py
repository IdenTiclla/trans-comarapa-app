import logging
from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from repositories.stats_repository import (
    StatsRepository,
    get_date_range,
    calculate_trend,
    compute_monthly_start,
    build_monthly_series,
    compute_monthly_trend,
)
from services.financial_summary_service import FinancialSummaryService
from core.exceptions import ForbiddenException

logger = logging.getLogger(__name__)


class StatsService:
    def __init__(self, db: Session, repo: StatsRepository | None = None):
        self.db = db
        self.repo = repo or StatsRepository(db)

    def get_ticket_stats(self, period: str) -> dict:
        start_date, end_date, prev_start, prev_end = get_date_range(period)
        current = self.repo.get_ticket_stats(start_date, end_date)
        previous = self.repo.get_ticket_stats(prev_start, prev_end)

        trend = calculate_trend(float(current.amount), float(previous.amount))
        return {
            "count": current.count,
            "amount": float(current.amount),
            "trend": round(trend, 2),
            "period": period,
        }

    def get_package_stats(self, period: str) -> dict:
        start_date, end_date, prev_start, prev_end = get_date_range(period)
        current = self.repo.get_package_stats(start_date, end_date)
        previous = self.repo.get_package_stats(prev_start, prev_end)

        count_trend = calculate_trend(float(current.count), float(previous.count))
        amount_trend = calculate_trend(float(current.amount), float(previous.amount))
        return {
            "count": current.count,
            "amount": float(current.amount),
            "trend": round(amount_trend, 2),
            "period": period,
        }

    def get_trip_stats(self, period: str) -> dict:
        start_date, end_date, prev_start, prev_end = get_date_range(period)
        current = self.repo.get_trip_stats(start_date, end_date)
        previous = self.repo.get_trip_stats(prev_start, prev_end)

        trend = calculate_trend(float(current.count), float(previous.count))
        return {"count": current.count, "trend": round(trend, 2), "period": period}

    def get_dashboard_stats(self, period: str) -> dict:
        return {
            "tickets": self.get_ticket_stats(period),
            "packages": self.get_package_stats(period),
            "trips": self.get_trip_stats(period),
        }

    def get_tickets_summary(self, period: str) -> dict:
        start_date, end_date, _, _ = get_date_range(period)
        confirmed, pending, cancelled, total_revenue = self.repo.get_tickets_summary(
            start_date, end_date
        )
        return {
            "confirmed": confirmed,
            "pending": pending,
            "cancelled": cancelled,
            "totalRevenue": total_revenue,
            "period": period,
        }

    def get_upcoming_trips(self, limit: int) -> list[dict]:
        trips = self.repo.get_upcoming_trips(limit)
        result = []
        for trip in trips:
            origin = (
                trip.route.origin_location.name
                if trip.route and trip.route.origin_location
                else "Desconocido"
            )
            destination = (
                trip.route.destination_location.name
                if trip.route and trip.route.destination_location
                else "Desconocido"
            )
            total_seats = trip.bus.capacity if trip.bus else 40
            occupied_seats = self.repo.get_occupied_seats_for_trip(trip.id) or 0
            result.append({
                "id": trip.id,
                "route": {"origin": origin, "destination": destination},
                "trip_datetime": trip.trip_datetime,
                "status": trip.status,
                "available_seats": total_seats - occupied_seats,
                "total_seats": total_seats,
            })
        return result

    def get_recent_sales(self, limit: int) -> list[dict]:
        recent_tickets = self.repo.get_recent_tickets_with_client(limit)
        recent_packages = self.repo.get_recent_packages_with_sender(limit)

        ticket_sales = []
        for ticket in recent_tickets:
            ticket_sales.append({
                "id": ticket.id,
                "type": "ticket",
                "reference": f"T-{ticket.id}",
                "client_name": f"{ticket.firstname} {ticket.lastname}",
                "amount": float(ticket.price),
                "date": ticket.confirmed_at,
                "status": ticket.state,
                "trip_id": ticket.trip_id,
            })

        package_sales = []
        for package in recent_packages:
            full_package = self.repo.get_package_by_id(package.id)
            package_sales.append({
                "id": package.id,
                "type": "package",
                "reference": f"P-{package.id}",
                "client_name": f"{package.firstname} {package.lastname}",
                "amount": float(full_package.total_amount) if full_package else 0.0,
                "date": package.created_at,
                "status": package.status,
                "trip_id": package.trip_id,
            })

        all_sales = ticket_sales + package_sales
        all_sales.sort(key=lambda x: x["date"], reverse=True)
        return all_sales[:limit]

    def get_sales_summary(self, period: str) -> dict:
        start_date, end_date, prev_start, prev_end = get_date_range(period)

        current_tickets = self.repo.get_ticket_stats(start_date, end_date)
        current_packages = self.repo.get_package_stats(start_date, end_date)
        previous_tickets = self.repo.get_ticket_stats(prev_start, prev_end)
        previous_packages = self.repo.get_package_stats(prev_start, prev_end)

        current_total = float(current_tickets.amount) + float(current_packages.amount)
        previous_total = float(previous_tickets.amount) + float(previous_packages.amount)
        trend = calculate_trend(current_total, previous_total)

        return {
            "totalAmount": current_total,
            "ticketCount": current_tickets.count,
            "packageCount": current_packages.count,
            "trend": round(trend, 2),
            "period": period,
        }

    def get_reserved_ticket_stats(self, period: str) -> dict:
        start_date, end_date, prev_start, prev_end = get_date_range(period)
        current = self.repo._pending_ticket_count(start_date, end_date)
        previous = self.repo._pending_ticket_count(prev_start, prev_end)
        trend = calculate_trend(float(current), float(previous))
        return {"count": current, "trend": round(trend, 2), "period": period}

    def _build_monthly_from_rows(self, rows, use_amount_as_value: bool = False) -> dict:
        data_dict = {}
        for row in rows:
            key = f"{int(row.year)}-{int(row.month)}"
            count = row.count
            amount = float(row.amount) if hasattr(row, "amount") and row.amount is not None else 0.0
            data_dict[key] = {"count": count, "amount": amount}
        return data_dict

    def _build_monthly_from_count_only(self, rows) -> dict:
        data_dict = {}
        for row in rows:
            key = f"{int(row.year)}-{int(row.month)}"
            data_dict[key] = {"count": row.count, "amount": 0.0}
        return data_dict

    def get_monthly_ticket_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_confirmed_tickets(start_date)
        data_dict = self._build_monthly_from_rows(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_reservation_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_pending_tickets(start_date)
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_package_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_packages_by_state(start_date, "in_transit")
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_trip_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_trips_by_status(
            start_date, ["scheduled", "in_progress", "completed"]
        )
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_revenue_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)

        ticket_rows = self.repo.get_monthly_ticket_revenue(start_date)
        ticket_dict = {}
        for row in ticket_rows:
            key = f"{int(row.year)}-{int(row.month)}"
            ticket_dict[key] = float(row.amount)

        package_rows = self.repo.get_monthly_package_revenue(start_date)
        package_dict = {}
        for row in package_rows:
            key = f"{int(row.year)}-{int(row.month)}"
            package_dict[key] = float(row.amount)

        combined_dict = {}
        for i in range(months):
            target_year = start_year
            target_month = start_month + i
            while target_month > 12:
                target_month -= 12
                target_year += 1
            key = f"{target_year}-{target_month}"
            total = ticket_dict.get(key, 0.0) + package_dict.get(key, 0.0)
            combined_dict[key] = {"count": 0, "amount": total}

        result_data = build_monthly_series(
            start_year, start_month, months, combined_dict, use_amount_as_value=True
        )
        return {"data": result_data, "trend": compute_monthly_trend(result_data, "amount")}

    def get_monthly_ticket_revenue_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_ticket_revenue(start_date)
        data_dict = self._build_monthly_from_rows(rows)
        result_data = build_monthly_series(
            start_year, start_month, months, data_dict, use_amount_as_value=True
        )
        return {"data": result_data, "trend": compute_monthly_trend(result_data, "amount")}

    def get_monthly_package_revenue_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_package_revenue(start_date)
        data_dict = self._build_monthly_from_rows(rows)
        result_data = build_monthly_series(
            start_year, start_month, months, data_dict, use_amount_as_value=True
        )
        return {"data": result_data, "trend": compute_monthly_trend(result_data, "amount")}

    def get_monthly_cancelled_ticket_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_tickets_by_state(start_date, "cancelled")
        data_dict = self._build_monthly_from_rows(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_completed_trip_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_trips_by_status(start_date, ["completed"])
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_cancelled_trip_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_trips_by_status(start_date, ["cancelled"])
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_client_feedback_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_client_feedback(start_date)

        data_dict = {}
        for row in rows:
            key = f"{int(row.year)}-{int(row.month)}"
            if row.total_tickets > 0:
                success_rate = row.successful_tickets / row.total_tickets
                rating = 3.5 + (success_rate * 1.5)
            else:
                rating = 4.0
            data_dict[key] = {"rating": round(rating, 1), "count": row.total_tickets}

        result_data = []
        for i in range(months):
            target_year = start_year
            target_month = start_month + i
            while target_month > 12:
                target_month -= 12
                target_year += 1

            from repositories.stats_repository import MONTH_NAMES
            month_label = MONTH_NAMES[target_month]
            key = f"{target_year}-{target_month}"

            entry = data_dict.get(key, {"rating": 4.0, "count": 0})
            rating = entry["rating"]
            count = entry["count"]

            result_data.append({
                "month": month_label,
                "label": month_label,
                "value": rating,
                "count": count,
                "amount": rating,
            })

        trend = 0.0
        if len(result_data) >= 2:
            current = result_data[-1]["value"]
            previous = result_data[-2]["value"]
            if previous > 0:
                trend = ((current - previous) / previous) * 100

        return {"data": result_data, "trend": round(trend, 2)}

    def get_monthly_registered_clients_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_registered_clients(start_date)
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_delivered_packages_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_packages_by_state(start_date, "delivered")
        data_dict = self._build_monthly_from_count_only(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_monthly_cancelled_reservation_stats(self, months: int) -> dict:
        start_year, start_month, start_date = compute_monthly_start(months)
        rows = self.repo.get_monthly_tickets_by_state(start_date, "cancelled")
        data_dict = self._build_monthly_from_rows(rows)
        result_data = build_monthly_series(start_year, start_month, months, data_dict)
        return {"data": result_data, "trend": compute_monthly_trend(result_data)}

    def get_cash_summary(self, current_user) -> dict:
        if current_user.role.value != "admin":
            raise ForbiddenException("Solo administradores pueden acceder")
        service = FinancialSummaryService(self.db)
        return service.get_cash_summary()
