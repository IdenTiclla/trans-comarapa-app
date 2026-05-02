from sqlalchemy.orm import Session
from models.office import Office
from repositories.office_repository import OfficeRepository
from schemas.office import OfficeCreate, OfficeUpdate
from core.exceptions import NotFoundException, ValidationException


class OfficeService:
    def __init__(self, db: Session):
        self.db = db
        self.office_repo = OfficeRepository(db)

    def _validate_location(self, location_id: int | None):
        if location_id is not None:
            if not self.office_repo.location_exists(location_id):
                raise NotFoundException(f"Location with id {location_id} not found")

    def create_office(self, data: OfficeCreate) -> Office:
        self._validate_location(data.location_id)
        
        office = Office(**data.model_dump())
        self.office_repo.create(office)
        self.db.commit()
        return office

    def update_office(self, office_id: int, data: OfficeUpdate) -> Office:
        office = self.office_repo.get_by_id_or_raise(office_id, "Office")
        
        update_data = data.model_dump(exclude_unset=True)
        if "location_id" in update_data:
            self._validate_location(update_data["location_id"])
            
        self.office_repo.update(office, update_data)
        self.db.commit()
        return office

    def delete_office(self, office_id: int) -> None:
        office = self.office_repo.get_by_id_or_raise(office_id, "Office")
        self.office_repo.delete(office)
        self.db.commit()

    def get_office(self, office_id: int) -> Office:
        return self.office_repo.get_by_id_or_raise(office_id, "Office")

    def get_offices(self, skip: int = 0, limit: int = 100) -> list[Office]:
        return self.office_repo.get_all(skip=skip, limit=limit)
