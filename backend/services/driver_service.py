import logging
from sqlalchemy.orm import Session

from repositories.driver_repository import DriverRepository
from models.driver import Driver
from core.exceptions import NotFoundException, ConflictException, ValidationException

logger = logging.getLogger(__name__)


class DriverService:
    def __init__(self, db: Session, repo: DriverRepository | None = None):
        self.db = db
        self.repo = repo or DriverRepository(db)

    def create(self, data: dict) -> Driver:
        if data.get("license_number"):
            existing = self.repo.get_by_license_number(data["license_number"])
            if existing:
                raise ConflictException("License number already exists.")
        driver = Driver(**data)
        self.repo.create(driver)
        self.db.commit()
        self.db.refresh(driver)
        return driver

    def get_all(self) -> list[Driver]:
        return self.repo.get_all_drivers()

    def get_by_id(self, driver_id: int) -> Driver:
        return self.repo.get_by_id_or_raise(driver_id, "Driver")

    def update(self, driver_id: int, update_data: dict) -> Driver:
        driver = self.repo.get_by_id_or_raise(driver_id, "Driver")
        if not update_data:
            raise ValidationException("Please enter some driver's information.")
        if update_data.get("license_number"):
            existing = self.repo.get_by_license_number(update_data["license_number"])
            if existing and existing.id != driver_id:
                raise ConflictException("License number already exists.")
        for field, value in update_data.items():
            setattr(driver, field, value)
        self.db.commit()
        self.db.refresh(driver)
        return driver

    def delete(self, driver_id: int) -> Driver:
        driver = self.repo.get_by_id_or_raise(driver_id, "Driver")
        result = Driver(
            id=driver.id, firstname=driver.firstname, lastname=driver.lastname,
            phone=driver.phone, license_number=driver.license_number,
        )
        self.repo.delete(driver)
        self.db.commit()
        return result
