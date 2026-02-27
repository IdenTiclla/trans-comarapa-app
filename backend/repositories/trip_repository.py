"""
Trip repository with domain-specific query methods.
"""

from typing import Optional, Any

from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc, asc

from models.trip import Trip
from repositories.base import BaseRepository


class TripRepository(BaseRepository[Trip]):

    def __init__(self, db: Session):
        super().__init__(Trip, db)

    def find_driver_conflict(
        self, driver_id: int, trip_datetime, exclude_trip_id: int | None = None
    ) -> Optional[Trip]:
        """Find if the driver already has a trip at the given datetime."""
        query = self.db.query(Trip).filter(
            Trip.driver_id == driver_id,
            Trip.trip_datetime == trip_datetime,
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def get_with_filters(
        self,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        route_id: Optional[int] = None,
        driver_id: Optional[int] = None,
        bus_id: Optional[int] = None,
        sort_by: str = "trip_datetime",
        sort_direction: str = "asc",
    ) -> tuple[list[Trip], int]:
        """Get trips with filtering, sorting, and pagination. Returns (trips, total_count)."""
        query = self.db.query(Trip)

        if status:
            query = query.filter(Trip.status == status)
        if route_id:
            query = query.filter(Trip.route_id == route_id)
        if driver_id:
            query = query.filter(Trip.driver_id == driver_id)
        if bus_id:
            query = query.filter(Trip.bus_id == bus_id)

        total = query.count()

        # Sorting
        sort_column = getattr(Trip, sort_by, Trip.trip_datetime)
        order_func = desc if sort_direction.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column))

        trips = query.offset(skip).limit(limit).all()
        return trips, total

    def get_upcoming(self, limit: int = 5) -> list[Trip]:
        """Get the next upcoming trips ordered by datetime."""
        from datetime import datetime
        return (
            self.db.query(Trip)
            .filter(Trip.trip_datetime >= datetime.now())
            .order_by(Trip.trip_datetime.asc())
            .limit(limit)
            .all()
        )
