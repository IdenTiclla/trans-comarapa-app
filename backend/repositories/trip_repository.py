from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc

from models.trip import Trip
from models.route import Route
from models.location import Location
from models.ticket import Ticket
from models.bus import Bus
from models.seat import Seat
from models.driver import Driver
from models.assistant import Assistant
from models.secretary import Secretary
from models.package import Package
from models.person import Person
from repositories.base import BaseRepository
from core.config import settings


class TripRepository(BaseRepository[Trip]):

    def __init__(self, db: Session):
        super().__init__(Trip, db)

    def find_driver_conflict(
        self, driver_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int | None = None
    ) -> Optional[Trip]:
        from datetime import timedelta
        buffer = buffer_hours if buffer_hours is not None else settings.TRIP_CONFLICT_BUFFER_HOURS
        start = trip_datetime - timedelta(hours=buffer)
        end = trip_datetime + timedelta(hours=buffer)
        query = self.db.query(Trip).filter(
            Trip.driver_id == driver_id,
            Trip.trip_datetime.between(start, end),
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def find_bus_conflict(
        self, bus_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int | None = None
    ) -> Optional[Trip]:
        from datetime import timedelta
        buffer = buffer_hours if buffer_hours is not None else settings.TRIP_CONFLICT_BUFFER_HOURS
        start = trip_datetime - timedelta(hours=buffer)
        end = trip_datetime + timedelta(hours=buffer)
        query = self.db.query(Trip).filter(
            Trip.bus_id == bus_id,
            Trip.trip_datetime.between(start, end),
        )
        if exclude_trip_id:
            query = query.filter(Trip.id != exclude_trip_id)
        return query.first()

    def find_assistant_conflict(
        self, assistant_id: int, trip_datetime, exclude_trip_id: int | None = None, buffer_hours: int | None = None
    ) -> Optional[Trip]:
        from datetime import timedelta
        buffer = buffer_hours if buffer_hours is not None else settings.TRIP_CONFLICT_BUFFER_HOURS
        start = trip_datetime - timedelta(hours=buffer)
        end = trip_datetime + timedelta(hours=buffer)
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

        sort_column = getattr(Trip, sort_by, Trip.trip_datetime)
        order_func = desc if sort_direction.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column))

        trips = query.offset(skip).limit(limit).all()
        return trips, total

    def get_upcoming(self, limit: int = 5) -> list[Trip]:
        return (
            self.db.query(Trip)
            .filter(Trip.trip_datetime >= datetime.now())
            .order_by(Trip.trip_datetime.asc())
            .limit(limit)
            .all()
        )

    def get_driver_by_id(self, driver_id: int) -> Optional[Driver]:
        return self.db.query(Driver).filter(Driver.id == driver_id).first()

    def get_assistant_by_id(self, assistant_id: int) -> Optional[Assistant]:
        return self.db.query(Assistant).filter(Assistant.id == assistant_id).first()

    def get_bus_by_id(self, bus_id: int) -> Optional[Bus]:
        return self.db.query(Bus).filter(Bus.id == bus_id).first()

    def get_route_by_id(self, route_id: int) -> Optional[Route]:
        return self.db.query(Route).filter(Route.id == route_id).first()

    def get_secretary_by_id(self, secretary_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()

    def get_person_by_user_id(self, user_id: int) -> Optional[Person]:
        return self.db.query(Person).filter(Person.user_id == user_id).first()

    def create_trip(self, trip: Trip) -> Trip:
        self.db.add(trip)
        self.db.flush()
        return trip

    def delete_trip(self, trip: Trip) -> None:
        self.db.delete(trip)
        self.db.flush()

    def get_seats_by_bus(self, bus_id: int) -> list[Seat]:
        return (
            self.db.query(Seat)
            .filter(Seat.bus_id == bus_id)
            .order_by(Seat.seat_number)
            .all()
        )

    def get_active_tickets_by_trip(self, trip_id: int) -> list[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(
                Ticket.trip_id == trip_id,
                Ticket.state.in_(["pending", "confirmed", "completed"]),
            )
            .all()
        )

    def count_occupied_seats(self, trip_id: int) -> int:
        return (
            self.db.query(func.count(Ticket.id))
            .filter(Ticket.trip_id == trip_id, Ticket.state != "cancelled")
            .scalar()
            or 0
        )

    def count_packages_by_trip(self, trip_id: int) -> int:
        return (
            self.db.query(func.count(Package.id))
            .filter(Package.trip_id == trip_id)
            .scalar()
            or 0
        )

    def get_tickets_by_trip(self, trip_id: int) -> list[Ticket]:
        return self.db.query(Ticket).filter(Ticket.trip_id == trip_id).all()

    def get_non_cancelled_tickets_by_trip(self, trip_id: int) -> list[Ticket]:
        return (
            self.db.query(Ticket)
            .filter(Ticket.trip_id == trip_id, Ticket.state != "cancelled")
            .all()
        )

    def get_packages_by_trip(self, trip_id: int) -> list[Package]:
        return self.db.query(Package).filter(Package.trip_id == trip_id).all()

    def get_packages_by_trip_and_status(self, trip_id: int, status: str) -> list[Package]:
        return (
            self.db.query(Package)
            .filter(Package.trip_id == trip_id, Package.status == status)
            .all()
        )

    def get_trips_by_person(
        self, person_type: str, person_id: int, status_filter: Optional[str] = None
    ) -> list[Trip]:
        query = self.db.query(Trip)
        if person_type == "driver":
            query = query.filter(Trip.driver_id == person_id)
        elif person_type == "assistant":
            query = query.filter(Trip.assistant_id == person_id)
        else:
            return []
        if status_filter:
            statuses = [s.strip() for s in status_filter.split(",")]
            query = query.filter(Trip.status.in_(statuses))
        return query.order_by(Trip.trip_datetime.desc()).all()

    def count_tickets_for_trip(self, trip_id: int) -> int:
        return self.db.query(Ticket).filter(Ticket.trip_id == trip_id).count()

    def get_seat_by_id(self, seat_id: int) -> Optional[Seat]:
        return self.db.query(Seat).filter(Seat.id == seat_id).first()
