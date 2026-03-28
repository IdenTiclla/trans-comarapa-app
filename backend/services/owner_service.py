from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from models.owner import Owner
from models.user import User, UserRole
from schemas.owner import OwnerCreate, OwnerUpdate
from core.exceptions import NotFoundException, ConflictException
import time

class OwnerService:
    def __init__(self, db: Session):
        self.db = db

    def get_owners(self, skip: int = 0, limit: int = 100) -> List[Owner]:
        return self.db.query(Owner).offset(skip).limit(limit).all()

    def get_owner(self, owner_id: int) -> Owner:
        owner = self.db.query(Owner).filter(Owner.id == owner_id).first()
        if not owner:
            raise NotFoundException(f"Dueño con ID {owner_id} no encontrado")
        return owner

    def create_owner(self, owner_in: OwnerCreate) -> Owner:
        # Generate a dummy user account for the owner to satisfy Person inheriting requirement
        timestamp = int(time.time())
        username = f"socio_{timestamp}_{owner_in.firstname.lower()}" if owner_in.firstname else f"socio_{timestamp}"
        email = f"{username}@transcomarapa.com"
        
        # Check if email/username already somehow exists
        if self.db.query(User).filter(User.email == email).first():
            email = f"2_{email}"
            
        hashed_password = User.get_password_hash("socio123")
        
        db_user = User(
            username=username,
            email=email,
            role=UserRole.OWNER,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=False
        )
        self.db.add(db_user)
        self.db.flush()
        
        owner_data = owner_in.model_dump(exclude_unset=True)
        # We don't need type as it's handled by polymorphic identity
        if 'type' in owner_data:
            del owner_data['type']
            
        db_owner = Owner(
            **owner_data,
            user_id=db_user.id
        )
        self.db.add(db_owner)
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
        self.db.delete(db_owner)
        self.db.commit()
