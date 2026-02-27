"""
Generic base repository providing common CRUD operations.

All specific repositories inherit from BaseRepository and add
domain-specific query methods. The base uses `flush()` instead of
`commit()` so the calling service controls the transaction boundary.
"""

from typing import Generic, TypeVar, Type, Optional

from sqlalchemy.orm import Session

from core.exceptions import NotFoundException

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Generic CRUD repository for SQLAlchemy models."""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, entity_id: int) -> Optional[ModelType]:
        """Get a single record by primary key, or None."""
        return self.db.query(self.model).filter(self.model.id == entity_id).first()

    def get_by_id_or_raise(self, entity_id: int, label: str | None = None) -> ModelType:
        """Get a single record by primary key or raise NotFoundException."""
        entity = self.get_by_id(entity_id)
        if not entity:
            name = label or self.model.__name__
            raise NotFoundException(f"{name} with id {entity_id} not found")
        return entity

    def get_all(self, *, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """Get a paginated list of records."""
        return (
            self.db.query(self.model)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj: ModelType) -> ModelType:
        """Add a new record and flush (without committing)."""
        self.db.add(obj)
        self.db.flush()
        return obj

    def update(self, entity: ModelType, update_data: dict) -> ModelType:
        """Apply a dict of updates to an existing record and flush."""
        for field, value in update_data.items():
            if value is not None:
                setattr(entity, field, value)
        self.db.flush()
        return entity

    def delete(self, entity: ModelType) -> None:
        """Delete a record and flush."""
        self.db.delete(entity)
        self.db.flush()
