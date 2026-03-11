from sqlalchemy.orm import Session
from models.office import Office
from models.location import Location
from repositories.office_repository import OfficeRepository
from schemas.office import OfficeCreate, OfficeUpdate
from core.exceptions import NotFoundException, ValidationException

class OfficeService:
    def __init__(self, db: Session):
        self.db = db
        self.office_repo = OfficeRepository(db)

    def _validate_location(self, location_id: int | None):
        """Validates that a location exists if location_id is provided."""
        if location_id is not None:
            location = self.db.query(Location).filter(Location.id == location_id).first()
            if not location:
                raise NotFoundException(f"Location with id {location_id} not found")

    def create_office(self, data: OfficeCreate) -> Office:
        """Create a new office."""
        self._validate_location(data.location_id)
        
        office = Office(**data.model_dump())
        self.office_repo.create(office)
        self.db.commit()
        return office

    def update_office(self, office_id: int, data: OfficeUpdate) -> Office:
        """Update an existing office."""
        office = self.office_repo.get_by_id_or_raise(office_id, "Office")
        
        update_data = data.model_dump(exclude_unset=True)
        if "location_id" in update_data:
            self._validate_location(update_data["location_id"])
            
        self.office_repo.update(office, update_data)
        self.db.commit()
        return office

    def delete_office(self, office_id: int) -> None:
        """Delete an office by its ID."""
        office = self.office_repo.get_by_id_or_raise(office_id, "Office")
        self.office_repo.delete(office)
        self.db.commit()

    def get_office(self, office_id: int) -> Office:
        """Get an office by its ID."""
        return self.office_repo.get_by_id_or_raise(office_id, "Office")

    def get_offices(self, skip: int = 0, limit: int = 100) -> list[Office]:
        """Get all offices with pagination."""
        return self.office_repo.get_all(skip=skip, limit=limit)
