from typing import Optional, List

from sqlalchemy.orm import Session, joinedload

from models.route import Route
from models.route_schedule import RouteSchedule
from models.location import Location
from models.trip import Trip
from repositories.base import BaseRepository


class LocationRepository(BaseRepository[Location]):
    def __init__(self, db: Session):
        super().__init__(Location, db)

    def exists_by_id(self, location_id: int) -> bool:
        return self.db.query(Location).filter(Location.id == location_id).first() is not None


class RouteRepository(BaseRepository[Route]):
    def __init__(self, db: Session):
        super().__init__(Route, db)

    def get_by_id_with_locations(self, route_id: int) -> Optional[Route]:
        return (
            self.db.query(Route)
            .options(
                joinedload(Route.origin_location),
                joinedload(Route.destination_location),
            )
            .filter(Route.id == route_id)
            .first()
        )

    def get_all_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[Route]:
        query = self.db.query(Route).options(
            joinedload(Route.origin_location),
            joinedload(Route.destination_location),
        )
        if origin:
            query = query.join(
                Location, Route.origin_location_id == Location.id
            ).filter(Location.name.ilike(f"%{origin}%"))
        if destination:
            query = query.join(
                Location, Route.destination_location_id == Location.id
            ).filter(Location.name.ilike(f"%{destination}%"))
        if min_price is not None:
            query = query.filter(Route.price >= min_price)
        if max_price is not None:
            query = query.filter(Route.price <= max_price)
        return query.offset(skip).limit(limit).all()

    def get_all_with_schedules(self) -> List[Route]:
        return (
            self.db.query(Route)
            .options(
                joinedload(Route.schedules),
                joinedload(Route.origin_location),
                joinedload(Route.destination_location),
            )
            .all()
        )

    def find_by_locations(
        self, origin_location_id: int, destination_location_id: int, exclude_id: Optional[int] = None
    ) -> Optional[Route]:
        query = self.db.query(Route).filter(
            Route.origin_location_id == origin_location_id,
            Route.destination_location_id == destination_location_id,
        )
        if exclude_id:
            query = query.filter(Route.id != exclude_id)
        return query.first()

    def get_trips_by_route(self, route_id: int) -> List[Trip]:
        return self.db.query(Trip).filter(Trip.route_id == route_id).all()

    def get_schedules(self, route_id: int) -> List[RouteSchedule]:
        return (
            self.db.query(RouteSchedule)
            .filter(RouteSchedule.route_id == route_id)
            .order_by(RouteSchedule.departure_time)
            .all()
        )

    def find_schedule_by_departure_time(
        self, route_id: int, departure_time, exclude_id: Optional[int] = None
    ) -> Optional[RouteSchedule]:
        query = self.db.query(RouteSchedule).filter(
            RouteSchedule.route_id == route_id,
            RouteSchedule.departure_time == departure_time,
        )
        if exclude_id:
            query = query.filter(RouteSchedule.id != exclude_id)
        return query.first()

    def create_schedule(self, schedule: RouteSchedule) -> RouteSchedule:
        self.db.add(schedule)
        self.db.flush()
        return schedule

    def delete_schedule(self, schedule: RouteSchedule) -> None:
        self.db.delete(schedule)
        self.db.flush()
