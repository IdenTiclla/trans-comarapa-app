"""
Route service - contains all route/schedule business logic.

Extracted from routes/route.py following the SRP pattern from package_service.py.
"""

import logging
from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from core.exceptions import NotFoundException, ConflictException, ValidationException
from models.location import Location as LocationModel
from models.route import Route as RouteModel
from models.route_schedule import RouteSchedule as RouteScheduleModel
from models.trip import Trip as TripModel
from schemas.route import RouteCreate, RouteUpdate
from schemas.route_schedule import RouteScheduleCreate, RouteScheduleUpdate

logger = logging.getLogger(__name__)


class RouteService:
    """Business logic for route and schedule operations."""

    def __init__(self, db: Session):
        self.db = db

    # ── Helpers ──────────────────────────────────────────────────────────

    def _validate_locations(
        self,
        origin_id: Optional[int],
        destination_id: Optional[int],
    ) -> None:
        """Ensure the given location IDs exist in the database."""
        if origin_id is not None:
            if not self.db.query(LocationModel).filter(LocationModel.id == origin_id).first():
                raise NotFoundException(f"Origin location with id {origin_id} not found")

        if destination_id is not None:
            if not self.db.query(LocationModel).filter(LocationModel.id == destination_id).first():
                raise NotFoundException(f"Destination location with id {destination_id} not found")

    def _get_route_or_raise(self, route_id: int) -> RouteModel:
        route = self.db.query(RouteModel).filter(RouteModel.id == route_id).first()
        if not route:
            raise NotFoundException("Route not found")
        return route

    def _get_schedule_or_raise(self, schedule_id: int, route_id: int) -> RouteScheduleModel:
        schedule = self.db.query(RouteScheduleModel).filter(
            RouteScheduleModel.id == schedule_id,
            RouteScheduleModel.route_id == route_id,
        ).first()
        if not schedule:
            raise NotFoundException("Schedule not found")
        return schedule

    # ── Route CRUD ───────────────────────────────────────────────────────

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[RouteModel]:
        """Get all routes with optional filters."""
        query = self.db.query(RouteModel)
        if origin:
            query = query.join(LocationModel, RouteModel.origin_location_id == LocationModel.id)\
                         .filter(LocationModel.name.ilike(f"%{origin}%"))
        if destination:
            query = query.join(LocationModel, RouteModel.destination_location_id == LocationModel.id)\
                         .filter(LocationModel.name.ilike(f"%{destination}%"))
        if min_price is not None:
            query = query.filter(RouteModel.price >= min_price)
        if max_price is not None:
            query = query.filter(RouteModel.price <= max_price)
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, route_id: int) -> RouteModel:
        return self._get_route_or_raise(route_id)

    def get_all_with_schedules(self) -> List[RouteModel]:
        return self.db.query(RouteModel).options(
            joinedload(RouteModel.schedules),
            joinedload(RouteModel.origin_location),
            joinedload(RouteModel.destination_location),
        ).all()

    def create_route(self, data: RouteCreate) -> RouteModel:
        """Validate locations, check uniqueness, create route."""
        self._validate_locations(data.origin_location_id, data.destination_location_id)

        existing = self.db.query(RouteModel).filter(
            RouteModel.origin_location_id == data.origin_location_id,
            RouteModel.destination_location_id == data.destination_location_id,
        ).first()
        if existing:
            raise ConflictException("Route between these locations already exists")

        db_route = RouteModel(**data.model_dump())
        self.db.add(db_route)
        self.db.commit()
        self.db.refresh(db_route)
        logger.info("Route created: %d", db_route.id)
        return db_route

    def update_route(self, route_id: int, data: RouteUpdate) -> RouteModel:
        """Validate locations if changing them, check no duplicate route, update."""
        db_route = self._get_route_or_raise(route_id)

        self._validate_locations(data.origin_location_id, data.destination_location_id)

        if data.origin_location_id or data.destination_location_id:
            existing = self.db.query(RouteModel).filter(
                RouteModel.origin_location_id == (data.origin_location_id or db_route.origin_location_id),
                RouteModel.destination_location_id == (data.destination_location_id or db_route.destination_location_id),
                RouteModel.id != route_id,
            ).first()
            if existing:
                raise ConflictException("Route between these locations already exists")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(db_route, field, value)

        self.db.commit()
        self.db.refresh(db_route)
        logger.info("Route %d updated", route_id)
        return db_route

    def delete_route(self, route_id: int) -> RouteModel:
        """Delete a route (fails if referenced by other records)."""
        route = self._get_route_or_raise(route_id)
        self.db.delete(route)
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise ValidationException("Cannot delete route as it is being referenced by other records")
        logger.info("Route %d deleted", route_id)
        return route

    def get_trips_by_route(self, route_id: int) -> List[TripModel]:
        self._get_route_or_raise(route_id)
        return self.db.query(TripModel).filter(TripModel.route_id == route_id).all()

    # ── Schedule CRUD ────────────────────────────────────────────────────

    def get_schedules(self, route_id: int) -> List[RouteScheduleModel]:
        self._get_route_or_raise(route_id)
        return self.db.query(RouteScheduleModel).filter(
            RouteScheduleModel.route_id == route_id
        ).order_by(RouteScheduleModel.departure_time).all()

    def create_schedule(self, route_id: int, data: RouteScheduleCreate) -> RouteScheduleModel:
        """Check for duplicate departure time, then create schedule."""
        self._get_route_or_raise(route_id)

        existing = self.db.query(RouteScheduleModel).filter(
            RouteScheduleModel.route_id == route_id,
            RouteScheduleModel.departure_time == data.departure_time,
        ).first()
        if existing:
            raise ConflictException("Schedule with this departure time already exists for this route")

        db_schedule = RouteScheduleModel(route_id=route_id, **data.model_dump())
        self.db.add(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        logger.info("Schedule created for route %d", route_id)
        return db_schedule

    def update_schedule(self, route_id: int, schedule_id: int, data: RouteScheduleUpdate) -> RouteScheduleModel:
        db_schedule = self._get_schedule_or_raise(schedule_id, route_id)

        update_data = data.model_dump(exclude_unset=True)
        if "departure_time" in update_data and update_data["departure_time"] is not None:
            existing = self.db.query(RouteScheduleModel).filter(
                RouteScheduleModel.route_id == route_id,
                RouteScheduleModel.departure_time == update_data["departure_time"],
                RouteScheduleModel.id != schedule_id,
            ).first()
            if existing:
                raise ConflictException("Schedule with this departure time already exists for this route")

        for field, value in update_data.items():
            setattr(db_schedule, field, value)

        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def delete_schedule(self, route_id: int, schedule_id: int) -> None:
        db_schedule = self._get_schedule_or_raise(schedule_id, route_id)
        self.db.delete(db_schedule)
        self.db.commit()
        logger.info("Schedule %d deleted from route %d", schedule_id, route_id)
