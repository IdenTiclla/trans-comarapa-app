"""
Trip repository with domain-specific query methods.
"""

from typing import Optional, Any
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc, asc

from models.trip import Trip
from models.route import Route
from models.location import Location
from models.ticket import Ticket
from models.bus import Bus
from repositories.base import BaseRepository


class TripRepository(BaseRepository[Trip]):

    def __init__(self, db: Session):
        super().__init__(Trip, db)

    def find_driver_conflict(
        self, driver_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int = 2
    ) -> Optional[Trip]:
        from datetime import timedelta
        start = trip_datetime - timedelta(hours=buffer_hours)
        end = trip_datetime + timedelta(hours=buffer_hours)
        query = self.db.query(Trip).filter(
            Trip.driver_id == driver_id,
            Trip.trip_datetime.between(start, end),
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def find_bus_conflict(
        self, bus_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int = 2
    ) -> Optional[Trip]:
        from datetime import timedelta
        start = trip_datetime - timedelta(hours=buffer_hours)
        end = trip_datetime + timedelta(hours=buffer_hours)
        query = self.db.query(Trip).filter(
            Trip.bus_id == bus_id,
            Trip.trip_datetime.between(start, end),
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def find_assistant_conflict(
        self, assistant_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int = 2
    ) -> Optional[Trip]:
        from datetime import timedelta
        start = trip_datetime - timedelta(hours=buffer_hours)
        end = trip_datetime + timedelta(hours=buffer_hours)
        query = self.db.query(Trip).filter(
            Trip.assistant_id == assistant_id,
            Trip.trip_datetime.between(start, end),
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def find_duplicate(
        self, trip_datetime, bus_id: int, route_id: int, driver_id: Optional[int], assistant_id: Optional[int]
    ) -> Optional[Trip]:
        query = self.db.query(Trip).filter(
            Trip.trip_datetime == trip_datetime,
            Trip.bus_id == bus_id,
            Trip.route_id == route_id,
        )
        if driver_id:
            query = query.filter(Trip.driver_id == driver_id)
        else:
            query = query.filter(Trip.driver_id == None)
            
        if assistant_id:
            query = query.filter(Trip.assistant_id == assistant_id)
        else:
            query = query.filter(Trip.assistant_id == None)
            
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
        upcoming: bool = False,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        min_seats: Optional[int] = None,
        sort_by: str = "trip_datetime",
        sort_direction: str = "asc",
    ) -> tuple[list[Trip], int]:
        """Get trips with filtering, sorting, and pagination. Returns (trips, total_count)."""
        query = self.db.query(Trip)

        if upcoming:
            query = query.filter(Trip.trip_datetime >= datetime.now())

        if search:
            search_conditions = []
            try:
                trip_id = int(search)
                search_conditions.append(Trip.id == trip_id)
            except ValueError:
                pass

            origin_subq = self.db.query(Trip.id).join(Route).join(
                Location, Route.origin_location_id == Location.id
            ).filter(Location.name.ilike(f"%{search}%"))
            
            dest_subq = self.db.query(Trip.id).join(Route).join(
                Location, Route.destination_location_id == Location.id
            ).filter(Location.name.ilike(f"%{search}%"))

            search_conditions.extend([Trip.id.in_(origin_subq), Trip.id.in_(dest_subq)])
            query = query.filter(or_(*search_conditions))

        if origin:
            origin_subq = self.db.query(Trip.id).join(Route).join(
                Location, Route.origin_location_id == Location.id
            ).filter(Location.name.ilike(f"%{origin}%"))
            query = query.filter(Trip.id.in_(origin_subq))

        if destination:
            dest_subq = self.db.query(Trip.id).join(Route).join(
                Location, Route.destination_location_id == Location.id
            ).filter(Location.name.ilike(f"%{destination}%"))
            query = query.filter(Trip.id.in_(dest_subq))

        if date_from:
            query = query.filter(Trip.trip_datetime >= date_from)
        if date_to:
            query = query.filter(Trip.trip_datetime <= date_to)

        if status:
            status_values = [s.strip() for s in status.split(',')]
            query = query.filter(Trip.status.in_(status_values))

        if route_id:
            query = query.filter(Trip.route_id == route_id)
        if driver_id:
            query = query.filter(Trip.driver_id == driver_id)
        if bus_id:
            query = query.filter(Trip.bus_id == bus_id)

        if min_seats is not None:
            occupied_seats_subq = self.db.query(
                Ticket.trip_id,
                func.count(Ticket.id).label('occupied_count')
            ).filter(Ticket.state != 'cancelled').group_by(Ticket.trip_id).subquery()

            query = query.join(Bus, Trip.bus_id == Bus.id).outerjoin(
                occupied_seats_subq, Trip.id == occupied_seats_subq.c.trip_id
            ).filter(
                Bus.capacity - func.coalesce(occupied_seats_subq.c.occupied_count, 0) >= min_seats
            )

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
