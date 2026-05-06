import logging
from typing import Optional
from sqlalchemy.orm import Session

from repositories.location_repository import LocationRepository
from models.location import Location
from models.user import User
from core.exceptions import NotFoundException, ConflictException

logger = logging.getLogger(__name__)


class LocationService:
    def __init__(self, db: Session, repo: LocationRepository | None = None):
        self.db = db
        self.repo = repo or LocationRepository(db)

    def create(self, data: dict) -> Location:
        existing = self.repo.get_by_name(data["name"])
        if existing:
            raise ConflictException("Location with this name already exists")
        location = Location(**data)
        self.repo.create(location)
        self.db.commit()
        self.db.refresh(location)
        return location

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
    ) -> list[Location]:
        return self.repo.get_all(skip=skip, limit=limit, search=search, city=city, state=state)

    def search_destinations(self, search: str, origin_location_id: int | None = None) -> list[Location]:
        return self.repo.search_destinations(search, origin_location_id)

    def get_by_id(self, location_id: int) -> Location:
        return self.repo.get_by_id_or_raise(location_id)

    def update(self, location_id: int, update_data: dict) -> Location:
        location = self.repo.get_by_id_or_raise(location_id)
        if update_data.get("name") and update_data["name"] != location.name:
            existing = self.repo.get_by_name(update_data["name"])
            if existing:
                raise ConflictException("Location with this name already exists")
        self.repo.update(location, update_data)
        self.db.commit()
        self.db.refresh(location)
        return location

    def delete(self, location_id: int) -> Location:
        location = self.repo.get_by_id_or_raise(location_id)
        self.repo.delete(location)
        self.db.commit()
        return location
