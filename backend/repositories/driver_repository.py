import logging
from sqlalchemy.orm import Session
from sqlalchemy import or_

from repositories.base import BaseRepository
from models.driver import Driver
from core.exceptions import NotFoundException, ConflictException, ValidationException

logger = logging.getLogger(__name__)


class DriverRepository(BaseRepository[Driver]):
    def __init__(self, db: Session):
        super().__init__(Driver, db)

    def get_by_license_number(self, license_number: str) -> Driver | None:
        return self.db.query(Driver).filter(Driver.license_number == license_number).first()

    def get_all_drivers(self) -> list[Driver]:
        return self.db.query(Driver).all()
