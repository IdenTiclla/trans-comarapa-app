from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import func, and_, or_, desc, cast, Date, extract, case
from sqlalchemy.orm import Session

from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from models.trip import Trip as TripModel
from models.client import Client as ClientModel
from models.package_item import PackageItem as PackageItemModel
from models.ticket_state_history import TicketStateHistory as TicketStateHistoryModel
from models.package_state_history import PackageStateHistory as PackageStateHistoryModel


MONTH_NAMES = [
    "", "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
]


def get_date_range(period: str):
    today = datetime.now().date()

    if period == "today":
        start_date = today
        end_date = today
        previous_start_date = today - timedelta(days=1)
        previous_end_date = today - timedelta(days=1)
    elif period == "yesterday":
        start_date = today - timedelta(days=1)
        end_date = today - timedelta(days=1)
        previous_start_date = today - timedelta(days=2)
        previous_end_date = today - timedelta(days=2)
    elif period == "week":
        weekday = today.weekday()
        start_date = today - timedelta(days=weekday)
        end_date = today
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    elif period == "month":
        start_date = today.replace(day=1)
        end_date = today
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    elif period == "year":
        start_date = today.replace(month=1, day=1)
        end_date = today
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    else:
        start_date = today
        end_date = today
        previous_start_date = today - timedelta(days=1)
        previous_end_date = today - timedelta(days=1)

    return start_date, end_date, previous_start_date, previous_end_date


def calculate_trend(current_value: float, previous_value: float) -> float:
    if previous_value == 0:
        return 100 if current_value > 0 else 0
    return ((current_value - previous_value) / previous_value) * 100


def compute_monthly_start(months: int) -> tuple[int, int, date]:
    today = datetime.now().date()
    current_month_start = today.replace(day=1)
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    return start_year, start_month, date(start_year, start_month, 1)


def build_monthly_series(
    start_year: int,
    start_month: int,
    months: int,
    data_dict: dict,
    value_key: str = "count",
    use_amount_as_value: bool = False,
) -> list[dict]:
    result_data = []
    for i in range(months):
        target_year = start_year
        target_month = start_month + i
        while target_month > 12:
            target_month -= 12
            target_year += 1

        month_label = MONTH_NAMES[target_month]
        key = f"{target_year}-{target_month}"

        entry = data_dict.get(key, {"count": 0, "amount": 0.0})
        count = entry["count"]
        amount = entry["amount"]

        value = amount if use_amount_as_value else count

        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": value,
            "count": count,
            "amount": amount,
        })

    return result_data


def compute_monthly_trend(result_data: list[dict], field: str = "count") -> float:
    trend = 0.0
    if len(result_data) >= 2:
        current = result_data[-1][field]
        previous = result_data[-2][field]
        if previous > 0:
            trend = ((current - previous) / previous) * 100
        elif current > 0:
            trend = 100.0
    return round(trend, 2)


class StatsRepository:
    def __init__(self, db: Session):
        self.db = db

    def _confirmed_ticket_count_amount(self, start_date, end_date):
        return (
            self.db.query(
                func.count(TicketModel.id).label("count"),
                func.coalesce(func.sum(TicketModel.price), 0).label("amount"),
            )
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "confirmed",
                ),
            )
            .filter(
                cast(TicketStateHistoryModel.changed_at, Date) >= start_date,
                cast(TicketStateHistoryModel.changed_at, Date) <= end_date,
                TicketModel.state.in_(["confirmed", "completed"]),
            )
            .first()
        )

    def _package_count_amount(self, start_date, end_date):
        return (
            self.db.query(
                func.count(PackageModel.id).label("count"),
                func.coalesce(
                    func.sum(
                        self.db.query(func.sum(PackageItemModel.total_price))
                        .filter(PackageItemModel.package_id == PackageModel.id)
                        .scalar_subquery()
                    ),
                    0,
                ).label("amount"),
            )
            .filter(
                cast(PackageModel.created_at, Date) >= start_date,
                cast(PackageModel.created_at, Date) <= end_date,
            )
            .first()
        )

    def _trip_count(self, start_date, end_date):
        return (
            self.db.query(func.count(TripModel.id).label("count"))
            .filter(
                cast(TripModel.trip_datetime, Date) >= start_date,
                cast(TripModel.trip_datetime, Date) <= end_date,
            )
            .first()
        )

    def _pending_ticket_count(self, start_date, end_date):
        return (
            self.db.query(func.count(TicketModel.id))
            .filter(
                cast(TicketModel.created_at, Date) >= start_date,
                cast(TicketModel.created_at, Date) <= end_date,
                TicketModel.state == "pending",
            )
            .scalar() or 0
        )

    def _cancelled_ticket_count(self, start_date, end_date):
        return (
            self.db.query(func.count(TicketModel.id))
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "cancelled",
                ),
            )
            .filter(
                cast(TicketStateHistoryModel.changed_at, Date) >= start_date,
                cast(TicketStateHistoryModel.changed_at, Date) <= end_date,
                TicketModel.state == "cancelled",
            )
            .scalar() or 0
        )

    def _confirmed_ticket_revenue(self, start_date, end_date):
        return (
            self.db.query(func.coalesce(func.sum(TicketModel.price), 0))
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "confirmed",
                ),
            )
            .filter(
                cast(TicketStateHistoryModel.changed_at, Date) >= start_date,
                cast(TicketStateHistoryModel.changed_at, Date) <= end_date,
                TicketModel.state.in_(["confirmed", "completed"]),
            )
            .scalar() or 0
        )

    def get_ticket_stats(self, start_date, end_date):
        return self._confirmed_ticket_count_amount(start_date, end_date)

    def get_package_stats(self, start_date, end_date):
        return self._package_count_amount(start_date, end_date)

    def get_trip_stats(self, start_date, end_date):
        return self._trip_count(start_date, end_date)

    def get_tickets_summary(self, start_date, end_date):
        confirmed = (
            self.db.query(func.count(TicketModel.id))
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "confirmed",
                ),
            )
            .filter(
                cast(TicketStateHistoryModel.changed_at, Date) >= start_date,
                cast(TicketStateHistoryModel.changed_at, Date) <= end_date,
                TicketModel.state.in_(["confirmed", "completed"]),
            )
            .scalar() or 0
        )
        pending = self._pending_ticket_count(start_date, end_date)
        cancelled = self._cancelled_ticket_count(start_date, end_date)
        total_revenue = float(self._confirmed_ticket_revenue(start_date, end_date))
        return confirmed, pending, cancelled, total_revenue

    def get_upcoming_trips(self, limit: int):
        now = datetime.now()
        return (
            self.db.query(TripModel)
            .filter(
                TripModel.trip_datetime >= now,
                TripModel.status.in_(["scheduled", "in_progress"]),
            )
            .order_by(TripModel.trip_datetime)
            .limit(limit)
            .all()
        )

    def get_occupied_seats_for_trip(self, trip_id: int):
        return (
            self.db.query(func.count(TicketModel.id))
            .filter(
                TicketModel.trip_id == trip_id,
                TicketModel.state.in_(["pending", "confirmed", "completed"]),
            )
            .scalar()
        )

    def get_recent_tickets_with_client(self, limit: int):
        return (
            self.db.query(
                TicketModel.id,
                TicketStateHistoryModel.changed_at.label("confirmed_at"),
                TicketModel.state,
                TicketModel.price,
                ClientModel.firstname,
                ClientModel.lastname,
                TripModel.id.label("trip_id"),
            )
            .join(ClientModel, TicketModel.client_id == ClientModel.id)
            .join(TripModel, TicketModel.trip_id == TripModel.id)
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "confirmed",
                ),
            )
            .filter(TicketModel.state.in_(["confirmed", "completed"]))
            .order_by(desc(TicketStateHistoryModel.changed_at))
            .limit(limit)
            .all()
        )

    def get_recent_packages_with_sender(self, limit: int):
        return (
            self.db.query(
                PackageModel.id,
                PackageModel.created_at,
                PackageModel.status,
                ClientModel.firstname,
                ClientModel.lastname,
                PackageModel.trip_id,
            )
            .join(ClientModel, PackageModel.sender_id == ClientModel.id)
            .order_by(desc(PackageModel.created_at))
            .limit(limit)
            .all()
        )

    def get_package_by_id(self, package_id: int):
        return self.db.query(PackageModel).filter(PackageModel.id == package_id).first()

    def get_monthly_confirmed_tickets(self, start_date: date):
        return (
            self.db.query(
                extract("year", TicketStateHistoryModel.changed_at).label("year"),
                extract("month", TicketStateHistoryModel.changed_at).label("month"),
                func.count(TicketModel.id).label("count"),
                func.coalesce(func.sum(TicketModel.price), 0).label("amount"),
            )
            .join(
                TicketStateHistoryModel,
                and_(
                    TicketStateHistoryModel.ticket_id == TicketModel.id,
                    TicketStateHistoryModel.new_state == "confirmed",
                ),
            )
            .filter(
                TicketStateHistoryModel.changed_at >= start_date,
                TicketModel.state.in_(["confirmed", "completed"]),
            )
            .group_by(
                extract("year", TicketStateHistoryModel.changed_at),
                extract("month", TicketStateHistoryModel.changed_at),
            )
            .order_by(
                extract("year", TicketStateHistoryModel.changed_at),
                extract("month", TicketStateHistoryModel.changed_at),
            )
            .all()
        )

    def get_monthly_pending_tickets(self, start_date: date):
        return (
            self.db.query(
                extract("year", TicketStateHistoryModel.changed_at).label("year"),
                extract("month", TicketStateHistoryModel.changed_at).label("month"),
                func.count(TicketStateHistoryModel.ticket_id.distinct()).label("count"),
            )
            .select_from(TicketStateHistoryModel)
            .filter(
                TicketStateHistoryModel.changed_at >= start_date,
                TicketStateHistoryModel.new_state == "pending",
            )
            .group_by(
                extract("year", TicketStateHistoryModel.changed_at),
                extract("month", TicketStateHistoryModel.changed_at),
            )
            .order_by(
                extract("year", TicketStateHistoryModel.changed_at),
                extract("month", TicketStateHistoryModel.changed_at),
            )
            .all()
        )

    def get_monthly_packages_by_state(self, start_date: date, state: str):
        return (
            self.db.query(
                extract("year", PackageStateHistoryModel.changed_at).label("year"),
                extract("month", PackageStateHistoryModel.changed_at).label("month"),
                func.count(PackageStateHistoryModel.package_id.distinct()).label("count"),
            )
            .join(PackageModel, PackageStateHistoryModel.package_id == PackageModel.id)
            .filter(
                PackageStateHistoryModel.changed_at >= start_date,
                PackageStateHistoryModel.new_state == state,
            )
            .group_by(
                extract("year", PackageStateHistoryModel.changed_at),
                extract("month", PackageStateHistoryModel.changed_at),
            )
            .order_by(
                extract("year", PackageStateHistoryModel.changed_at),
                extract("month", PackageStateHistoryModel.changed_at),
            )
            .all()
        )

    def get_monthly_trips_by_status(self, start_date: date, statuses: list[str]):
        return (
            self.db.query(
                extract("year", TripModel.trip_datetime).label("year"),
                extract("month", TripModel.trip_datetime).label("month"),
                func.count(TripModel.id).label("count"),
            )
            .filter(
                TripModel.trip_datetime >= start_date,
                TripModel.status.in_(statuses),
            )
            .group_by(
                extract("year", TripModel.trip_datetime),
                extract("month", TripModel.trip_datetime),
            )
            .order_by(
                extract("year", TripModel.trip_datetime),
                extract("month", TripModel.trip_datetime),
            )
            .all()
        )

    def get_monthly_ticket_revenue(self, start_date: date):
        return self.get_monthly_confirmed_tickets(start_date)

    def get_monthly_package_revenue(self, start_date: date):
        return (
            self.db.query(
                extract("year", PackageModel.created_at).label("year"),
                extract("month", PackageModel.created_at).label("month"),
                func.count(PackageModel.id).label("count"),
                func.coalesce(func.sum(PackageItemModel.total_price), 0).label("amount"),
            )
            .join(PackageItemModel, PackageModel.id == PackageItemModel.package_id)
            .filter(
                PackageModel.created_at >= start_date,
                PackageModel.status.in_(["registered", "in_transit", "delivered"]),
            )
            .group_by(
                extract("year", PackageModel.created_at),
                extract("month", PackageModel.created_at),
            )
            .order_by(
                extract("year", PackageModel.created_at),
                extract("month", PackageModel.created_at),
            )
            .all()
        )

    def get_monthly_tickets_by_state(self, start_date: date, state: str):
        return (
            self.db.query(
                extract("year", TicketModel.created_at).label("year"),
                extract("month", TicketModel.created_at).label("month"),
                func.count(TicketModel.id).label("count"),
                func.coalesce(func.sum(TicketModel.price), 0).label("amount"),
            )
            .filter(
                TicketModel.created_at >= start_date,
                TicketModel.state == state,
            )
            .group_by(
                extract("year", TicketModel.created_at),
                extract("month", TicketModel.created_at),
            )
            .order_by(
                extract("year", TicketModel.created_at),
                extract("month", TicketModel.created_at),
            )
            .all()
        )

    def get_monthly_client_feedback(self, start_date: date):
        return (
            self.db.query(
                extract("year", TicketModel.created_at).label("year"),
                extract("month", TicketModel.created_at).label("month"),
                func.count(case((TicketModel.state != "cancelled", 1))).label("successful_tickets"),
                func.count(TicketModel.id).label("total_tickets"),
            )
            .filter(TicketModel.created_at >= start_date)
            .group_by(
                extract("year", TicketModel.created_at),
                extract("month", TicketModel.created_at),
            )
            .order_by(
                extract("year", TicketModel.created_at),
                extract("month", TicketModel.created_at),
            )
            .all()
        )

    def get_monthly_registered_clients(self, start_date: date):
        return (
            self.db.query(
                extract("year", ClientModel.created_at).label("year"),
                extract("month", ClientModel.created_at).label("month"),
                func.count(ClientModel.id).label("count"),
            )
            .filter(
                ClientModel.created_at >= start_date,
                or_(
                    ClientModel.id.in_(
                        self.db.query(TicketModel.client_id).distinct().subquery()
                    ),
                    ClientModel.id.in_(
                        self.db.query(PackageModel.sender_id).distinct().subquery()
                    ),
                ),
            )
            .group_by(
                extract("year", ClientModel.created_at),
                extract("month", ClientModel.created_at),
            )
            .order_by(
                extract("year", ClientModel.created_at),
                extract("month", ClientModel.created_at),
            )
            .all()
        )
