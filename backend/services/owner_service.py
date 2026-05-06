from sqlalchemy.orm import Session
from typing import List
from models.owner import Owner
from models.user import User, UserRole
from repositories.owner_repository import OwnerRepository
from repositories.user_repository import UserRepository
from schemas.owner import OwnerCreate, OwnerUpdate
from core.exceptions import NotFoundException, ConflictException
from core.security import get_password_hash
from core.config import settings
import time


class OwnerService:
    def __init__(self, db: Session):
        self.db = db
        self.owner_repo = OwnerRepository(db)
        self.user_repo = UserRepository(db)

    def get_owners(self, skip: int = 0, limit: int = 100) -> List[Owner]:
        return self.owner_repo.get_all_owners(skip, limit)

    def get_owner(self, owner_id: int) -> Owner:
        owner = self.owner_repo.get_by_id_or_none(owner_id)
        if not owner:
            raise NotFoundException(f"Dueño con ID {owner_id} no encontrado")
        return owner

    def create_owner(self, owner_in: OwnerCreate) -> Owner:
        timestamp = int(time.time())
        username = f"socio_{timestamp}_{owner_in.firstname.lower()}" if owner_in.firstname else f"socio_{timestamp}"
        email = f"{username}@{settings.EMAIL_DOMAIN}"
            
        if self.user_repo.get_by_email(email):
            email = f"2_{email}"
            
        hashed_password = get_password_hash(settings.DEFAULT_OWNER_PASSWORD)
        
        db_user = User(
            username=username,
            email=email,
            role=UserRole.OWNER,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=False
        )
        self.user_repo.create_user(db_user)
        
        owner_data = owner_in.model_dump(exclude_unset=True)
        if 'type' in owner_data:
            del owner_data['type']
            
        db_owner = Owner(
            **owner_data,
            user_id=db_user.id
        )
        self.owner_repo.create(db_owner)
        self.db.commit()
        self.db.refresh(db_owner)
        return db_owner

    def update_owner(self, owner_id: int, owner_in: OwnerUpdate) -> Owner:
        db_owner = self.get_owner(owner_id)
        
        update_data = owner_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_owner, field, value)
            
        self.db.commit()
        self.db.refresh(db_owner)
        return db_owner

    def delete_owner(self, owner_id: int) -> None:
        db_owner = self.get_owner(owner_id)
        self.owner_repo.delete(db_owner)
        self.db.commit()
