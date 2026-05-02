from sqlalchemy.orm import Session
from models.office import Office
from models.location import Location
from repositories.base import BaseRepository


class OfficeRepository(BaseRepository[Office]):
    def __init__(self, db: Session):
        super().__init__(Office, db)

    def location_exists(self, location_id: int) -> bool:
        return (
            self.db.query(Location).filter(Location.id == location_id).first()
            is not None
        )
