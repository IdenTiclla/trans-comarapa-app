from sqlalchemy.orm import Session
from models.office import Office
from repositories.base import BaseRepository

class OfficeRepository(BaseRepository[Office]):
    """Data access methods for Office models."""
    
    def __init__(self, db: Session):
        super().__init__(Office, db)
