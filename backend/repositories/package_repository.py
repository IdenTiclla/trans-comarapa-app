"""
Package repository with domain-specific query methods.
"""

from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.package import Package
from models.package_state_history import PackageStateHistory
from repositories.base import BaseRepository


class PackageRepository(BaseRepository[Package]):
    def __init__(self, db: Session):
        super().__init__(Package, db)

    def _with_eager_loading(self):
        """Base query with common eager-loaded relationships."""
        return self.db.query(Package).options(
            joinedload(Package.items),
            joinedload(Package.sender),
            joinedload(Package.recipient),
            joinedload(Package.trip),
            joinedload(Package.secretary),
            joinedload(Package.state_history),
            joinedload(Package.origin_office),
            joinedload(Package.destination_office),
        )

    def get_by_id_eager(self, package_id: int) -> Optional[Package]:
        """Get a package with all relationships eagerly loaded."""
        return self._with_eager_loading().filter(Package.id == package_id).first()

    def get_unassigned(self, skip: int = 0, limit: int = 100) -> list[Package]:
        """Get packages without an assigned trip (registered_at_office)."""
        return (
            self._with_eager_loading()
            .filter(
                Package.trip_id == None,
                Package.status == "registered_at_office",
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_sender(self, client_id: int) -> list[Package]:
        """Get all packages sent by a client."""
        return self._with_eager_loading().filter(Package.sender_id == client_id).all()

    def get_by_recipient(self, client_id: int) -> list[Package]:
        """Get all packages for a recipient client."""
        return (
            self._with_eager_loading().filter(Package.recipient_id == client_id).all()
        )

    def get_by_trip(self, trip_id: int) -> list[Package]:
        """Get all packages assigned to a trip."""
        return self._with_eager_loading().filter(Package.trip_id == trip_id).all()

    def search_by_tracking(self, tracking_number: str) -> Optional[Package]:
        """Find a package by its tracking number."""
        return (
            self._with_eager_loading()
            .filter(Package.tracking_number == tracking_number.upper())
            .first()
        )

    def find_by_tracking_number(self, tracking_number: str) -> Optional[Package]:
        """Check if a tracking number already exists."""
        return (
            self.db.query(Package)
            .filter(Package.tracking_number == tracking_number)
            .first()
        )

    def log_state_change(
        self,
        package_id: int,
        old_state: Optional[str],
        new_state: str,
        changed_by_user_id: Optional[int] = None,
    ) -> PackageStateHistory:
        """Create a package state history entry."""
        entry = PackageStateHistory(
            package_id=package_id,
            old_state=old_state,
            new_state=new_state,
            changed_by_user_id=changed_by_user_id,
        )
        self.db.add(entry)
        self.db.flush()
        return entry

    def get_pending_collections(
        self, office_id: int, skip: int = 0, limit: int = 100
    ) -> list[Package]:
        """Get packages pending collection at destination office.

        Packages where:
        - destination_office_id == office_id
        - payment_status == 'collect_on_delivery'
        - status == 'arrived_at_destination'
        """
        return (
            self._with_eager_loading()
            .filter(
                Package.destination_office_id == office_id,
                Package.payment_status == "collect_on_delivery",
                Package.status == "arrived_at_destination",
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
