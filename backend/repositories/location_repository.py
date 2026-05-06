import logging
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.location import Location
from models.route import Route

logger = logging.getLogger(__name__)


class LocationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, location_id: int) -> Location | None:
        return self.db.query(Location).filter(Location.id == location_id).first()

    def get_by_id_or_raise(self, location_id: int) -> Location:
        location = self.get_by_id(location_id)
        if not location:
            from core.exceptions import NotFoundException
            raise NotFoundException(f"Location with id {location_id} not found")
        return location

    def get_by_name(self, name: str) -> Location | None:
        return self.db.query(Location).filter(Location.name == name).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
    ) -> list[Location]:
        query = self.db.query(Location)
        if search:
            query = query.filter(
                or_(
                    Location.name.ilike(f"%{search}%"),
                    Location.description.ilike(f"%{search}%"),
                )
            )
        if city:
            query = query.filter(Location.city == city)
        if state:
            query = query.filter(Location.state == state)
        return query.offset(skip).limit(limit).all()

    def search_destinations(
        self, search: str, origin_location_id: int | None = None
    ) -> list[Location]:
        query = self.db.query(Location)
        if origin_location_id:
            route_destinations = (
                self.db.query(Route.destination_location_id)
                .filter(Route.origin_location_id == origin_location_id)
                .subquery()
            )
            query = query.filter(Location.id.in_(route_destinations))
        if search.strip():
            query = query.filter(
                or_(
                    Location.name.ilike(f"%{search.strip()}%"),
                    Location.description.ilike(f"%{search.strip()}%"),
                )
            )
        return query.limit(20).all()

    def create(self, location: Location) -> Location:
        self.db.add(location)
        self.db.flush()
        return location

    def update(self, location: Location, update_data: dict) -> Location:
        for field, value in update_data.items():
            setattr(location, field, value)
        self.db.flush()
        return location

    def delete(self, location: Location) -> None:
        self.db.delete(location)
        self.db.flush()
