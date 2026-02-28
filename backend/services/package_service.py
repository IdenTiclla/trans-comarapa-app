"""
Package service - contains all package/encomienda business logic.

Extracted from routes/package.py.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session, joinedload

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
)
from core.state_machines import PACKAGE_TRANSITIONS, validate_transition
from models.package import Package
from models.package_item import PackageItem
from models.package_state_history import PackageStateHistory
from models.trip import Trip
from repositories.package_repository import PackageRepository
from schemas.package import PackageCreate, PackageUpdate, PackageAssignTrip, PackageStatusUpdate, PackageSummary

logger = logging.getLogger(__name__)


class PackageService:
    """Business logic for package operations."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = PackageRepository(db)

    # ── Read operations ──────────────────────────────────────────────────

    def get_all(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> list[Package]:
        """Get all packages with optional status filter."""
        query = self.db.query(Package).options(
            joinedload(Package.sender),
            joinedload(Package.recipient),
            joinedload(Package.items),
        )
        if status and status.lower() != "all":
            query = query.filter(Package.status == status)
        return query.order_by(Package.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, package_id: int) -> Package:
        """Get a package by ID with relationships."""
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException(f"Package with id {package_id} not found")
        return pkg

    def get_unassigned(self, skip: int = 0, limit: int = 100) -> list[Package]:
        """Get packages without a trip assignment."""
        return self.repo.get_unassigned(skip, limit)

    def get_by_tracking(self, tracking_number: str) -> Package:
        """Get package by tracking number."""
        pkg = self.repo.search_by_tracking(tracking_number)
        if not pkg:
            raise NotFoundException(f"Package with tracking number {tracking_number} not found")
        return pkg

    def get_by_sender(self, client_id: int) -> list[Package]:
        return self.repo.get_by_sender(client_id)

    def get_by_recipient(self, client_id: int) -> list[Package]:
        return self.repo.get_by_recipient(client_id)

    def get_by_trip(self, trip_id: int) -> list[Package]:
        return self.repo.get_by_trip(trip_id)

    # ── Create / Update / Delete ─────────────────────────────────────────

    def create_package(self, data: PackageCreate) -> Package:
        """Create a new package with items."""
        logger.debug("Creating package with data: %s", data)

        # Check unique tracking
        existing = self.repo.find_by_tracking_number(data.tracking_number)
        if existing:
            raise ConflictException(
                f"Package with tracking number {data.tracking_number} already exists"
            )

        # Create the package
        package_data = data.model_dump(exclude={"items"})
        package_data["status"] = "registered_at_office"
        db_package = Package(**package_data)
        self.db.add(db_package)
        self.db.flush()

        # Create items
        for item_data in data.items:
            item_dict = item_data.model_dump()
            item_dict["total_price"] = item_dict["quantity"] * item_dict["unit_price"]
            item_dict["package_id"] = db_package.id
            self.db.add(PackageItem(**item_dict))

        # Log initial state
        self.repo.log_state_change(
            package_id=db_package.id,
            old_state=None,
            new_state="registered_at_office",
        )

        self.db.commit()

        # Re-query with eager loading
        result = self.repo.get_by_id_eager(db_package.id)
        logger.debug("Package created: %d with %d items", result.id, len(result.items))
        return result

    def update_package(self, package_id: int, data: PackageUpdate) -> Package:
        """Update package metadata (not items)."""
        pkg = self.repo.get_by_id_or_raise(package_id, "Package")
        for field, value in data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(pkg, field, value)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def delete_package(self, package_id: int) -> str:
        """Delete a package and return its tracking number."""
        pkg = self.repo.get_by_id_or_raise(package_id, "Package")
        tracking = pkg.tracking_number
        self.db.delete(pkg)
        self.db.commit()
        return tracking

    # ── Trip assignment ──────────────────────────────────────────────────

    def assign_to_trip(self, package_id: int, data: PackageAssignTrip) -> Package:
        """Assign a package to a trip."""
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        if pkg.status != "registered_at_office":
            raise ValidationException(
                f"Solo se pueden asignar encomiendas en estado 'registered_at_office'. Estado actual: '{pkg.status}'"
            )

        trip = self.db.query(Trip).filter(Trip.id == data.trip_id).first()
        if not trip:
            raise NotFoundException("Viaje no encontrado")

        old_status = pkg.status
        pkg.trip_id = data.trip_id
        pkg.status = "assigned_to_trip"

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="assigned_to_trip",
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def unassign_from_trip(self, package_id: int) -> Package:
        """Remove a package from its assigned trip."""
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        if pkg.status != "assigned_to_trip":
            raise ValidationException(
                f"Solo se pueden desasignar encomiendas en estado 'assigned_to_trip'. Estado actual: '{pkg.status}'"
            )

        old_status = pkg.status
        pkg.trip_id = None
        pkg.status = "registered_at_office"

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="registered_at_office",
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def update_status(self, package_id: int, data: PackageStatusUpdate) -> Package:
        """Update package status with state machine validation."""
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        # Use state machine for validation
        validate_transition("package", PACKAGE_TRANSITIONS, pkg.status, data.new_status)

        old_status = pkg.status
        pkg.status = data.new_status

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state=data.new_status,
            changed_by_user_id=data.changed_by_user_id,
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def deliver_package(self, package_id: int, payment_method: str, changed_by_user_id: Optional[int] = None) -> Package:
        """Deliver a package and handle payment status."""
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        # Use state machine for validation
        validate_transition("package", PACKAGE_TRANSITIONS, pkg.status, "delivered")

        old_status = pkg.status
        pkg.status = "delivered"

        if pkg.payment_status == "collect_on_delivery":
            pkg.payment_method = payment_method

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="delivered",
            changed_by_user_id=changed_by_user_id,
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    # ── Package items ────────────────────────────────────────────────────

    def get_items(self, package_id: int) -> list[PackageItem]:
        """Get items for a package."""
        self.repo.get_by_id_or_raise(package_id, "Package")
        return self.db.query(PackageItem).filter(PackageItem.package_id == package_id).all()

    def add_item(self, package_id: int, item_data: dict) -> PackageItem:
        """Add an item to a package."""
        self.repo.get_by_id_or_raise(package_id, "Package")
        item_dict = item_data.model_dump()
        item_dict["total_price"] = item_dict["quantity"] * item_dict["unit_price"]
        item_dict["package_id"] = package_id
        db_item = PackageItem(**item_dict)
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def update_item(self, item_id: int, item_data: dict) -> PackageItem:
        """Update a package item."""
        db_item = self.db.query(PackageItem).filter(PackageItem.id == item_id).first()
        if not db_item:
            raise NotFoundException("Package item not found")

        for field, value in item_data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(db_item, field, value)

        db_item.total_price = db_item.quantity * db_item.unit_price
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_item(self, item_id: int) -> None:
        """Delete a package item (must keep at least one)."""
        db_item = self.db.query(PackageItem).filter(PackageItem.id == item_id).first()
        if not db_item:
            raise NotFoundException("Package item not found")

        count = self.db.query(PackageItem).filter(
            PackageItem.package_id == db_item.package_id
        ).count()
        if count <= 1:
            raise ValidationException(
                "Cannot delete the last item of a package. Delete the entire package instead."
            )

        self.db.delete(db_item)
        self.db.commit()

    # ── Helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def to_summary(pkg: Package) -> PackageSummary:
        """Convert a Package model to a summary schema."""
        items_preview = []
        if getattr(pkg, "items", None):
            items_preview = pkg.items[:5]

        return PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}" if pkg.sender else None,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}" if pkg.recipient else None,
            trip_id=pkg.trip_id,
            payment_status=pkg.payment_status,
            payment_method=pkg.payment_method,
            created_at=pkg.created_at,
            items=items_preview,
        )
