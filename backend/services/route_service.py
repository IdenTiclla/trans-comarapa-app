import logging
from typing import List, Optional

from sqlalchemy.orm import Session

from core.exceptions import NotFoundException, ConflictException, ValidationException
from models.route import Route as RouteModel
from models.route_schedule import RouteSchedule as RouteScheduleModel
from models.trip import Trip as TripModel
from repositories.route_repository import RouteRepository, LocationRepository
from schemas.route import RouteCreate, RouteUpdate
from schemas.route_schedule import RouteScheduleCreate, RouteScheduleUpdate

logger = logging.getLogger(__name__)


class RouteService:

    def __init__(self, db: Session):
        self.db = db
        self.route_repo = RouteRepository(db)
        self.location_repo = LocationRepository(db)

    def _validate_locations(
        self,
        origin_id: Optional[int],
        destination_id: Optional[int],
    ) -> None:
        if origin_id is not None:
            if not self.location_repo.exists_by_id(origin_id):
                raise NotFoundException(
                    f"Origin location with id {origin_id} not found"
                )
        if destination_id is not None:
            if not self.location_repo.exists_by_id(destination_id):
                raise NotFoundException(
                    f"Destination location with id {destination_id} not found"
                )

    def _get_route_or_raise(self, route_id: int) -> RouteModel:
        route = self.route_repo.get_by_id_with_locations(route_id)
        if not route:
            raise NotFoundException("Route not found")
        return route

    def _get_schedule_or_raise(
        self, schedule_id: int, route_id: int
    ) -> RouteScheduleModel:
        schedule = self.route_repo.get_by_id_or_raise(schedule_id, "RouteSchedule")
        if schedule.route_id != route_id:
            raise NotFoundException("Schedule not found")
        return schedule

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[RouteModel]:
        return self.route_repo.get_all_with_filters(
            skip, limit, origin, destination, min_price, max_price
        )

    def get_by_id(self, route_id: int) -> RouteModel:
        route = self.route_repo.get_by_id_with_locations(route_id)
        if not route:
            raise NotFoundException("Route not found")
        return route

    def get_all_with_schedules(self) -> List[RouteModel]:
        return self.route_repo.get_all_with_schedules()

    def create_route(self, data: RouteCreate) -> RouteModel:
        self._validate_locations(data.origin_location_id, data.destination_location_id)

        existing = self.route_repo.find_by_locations(
            data.origin_location_id, data.destination_location_id
        )
        if existing:
            raise ConflictException("Route between these locations already exists")

        db_route = RouteModel(**data.model_dump())
        self.route_repo.create(db_route)
        self.db.commit()
        self.db.refresh(db_route)
        logger.info("Route created: %d", db_route.id)
        return db_route

    def update_route(self, route_id: int, data: RouteUpdate) -> RouteModel:
        db_route = self._get_route_or_raise(route_id)

        self._validate_locations(data.origin_location_id, data.destination_location_id)

        if data.origin_location_id or data.destination_location_id:
            existing = self.route_repo.find_by_locations(
                data.origin_location_id or db_route.origin_location_id,
                data.destination_location_id or db_route.destination_location_id,
                exclude_id=route_id,
            )
            if existing:
                raise ConflictException("Route between these locations already exists")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(db_route, field, value)

        self.db.commit()
        self.db.refresh(db_route)
        logger.info("Route %d updated", route_id)
        return db_route

    def delete_route(self, route_id: int) -> RouteModel:
        route = self._get_route_or_raise(route_id)
        self.route_repo.delete(route)
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise ValidationException(
                "Cannot delete route as it is being referenced by other records"
            )
        logger.info("Route %d deleted", route_id)
        return route

    def get_trips_by_route(self, route_id: int) -> List[TripModel]:
        self._get_route_or_raise(route_id)
        return self.route_repo.get_trips_by_route(route_id)

    def get_schedules(self, route_id: int) -> List[RouteScheduleModel]:
        self._get_route_or_raise(route_id)
        return self.route_repo.get_schedules(route_id)

    def create_schedule(
        self, route_id: int, data: RouteScheduleCreate
    ) -> RouteScheduleModel:
        self._get_route_or_raise(route_id)

        existing = self.route_repo.find_schedule_by_departure_time(
            route_id, data.departure_time
        )
        if existing:
            raise ConflictException(
                "Schedule with this departure time already exists for this route"
            )

        db_schedule = RouteScheduleModel(route_id=route_id, **data.model_dump())
        self.route_repo.create_schedule(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        logger.info("Schedule created for route %d", route_id)
        return db_schedule

    def update_schedule(
        self, route_id: int, schedule_id: int, data: RouteScheduleUpdate
    ) -> RouteScheduleModel:
        db_schedule = self._get_schedule_or_raise(schedule_id, route_id)

        update_data = data.model_dump(exclude_unset=True)
        if (
            "departure_time" in update_data
            and update_data["departure_time"] is not None
        ):
            existing = self.route_repo.find_schedule_by_departure_time(
                route_id, update_data["departure_time"], exclude_id=schedule_id
            )
            if existing:
                raise ConflictException(
                    "Schedule with this departure time already exists for this route"
                )

        for field, value in update_data.items():
            setattr(db_schedule, field, value)

        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule

    def delete_schedule(self, route_id: int, schedule_id: int) -> None:
        db_schedule = self._get_schedule_or_raise(schedule_id, route_id)
        self.route_repo.delete_schedule(db_schedule)
        self.db.commit()
        logger.info("Schedule %d deleted from route %d", schedule_id, route_id)
