from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.package import Package
from models.package_item import PackageItem
from models.package_state_history import PackageStateHistory
from models.cash_transaction import CashTransaction
from models.secretary import Secretary
from models.trip import Trip
from models.route import Route
from models.client import Client
from sqlalchemy import or_
from sqlalchemy.orm import aliased
from repositories.base import BaseRepository


class PackageRepository(BaseRepository[Package]):
    def __init__(self, db: Session):
        super().__init__(Package, db)

    def _with_eager_loading(self):
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
        return self._with_eager_loading().filter(Package.id == package_id).first()

    def get_unassigned(self, skip: int = 0, limit: int = 100) -> list[Package]:
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
        return self._with_eager_loading().filter(Package.sender_id == client_id).all()

    def get_by_recipient(self, client_id: int) -> list[Package]:
        return self._with_eager_loading().filter(Package.recipient_id == client_id).all()

    def get_by_trip(self, trip_id: int) -> list[Package]:
        return self._with_eager_loading().filter(Package.trip_id == trip_id).all()

    def search_by_tracking(self, tracking_number: str) -> Optional[Package]:
        return (
            self._with_eager_loading()
            .filter(Package.tracking_number == tracking_number.upper())
            .first()
        )

    def find_by_tracking_number(self, tracking_number: str) -> Optional[Package]:
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

    def get_all_with_filters(
        self, skip: int = 0, limit: int = 100, status: Optional[str] = None
    ) -> list[Package]:
        query = self.db.query(Package).options(
            joinedload(Package.sender),
            joinedload(Package.recipient),
            joinedload(Package.items),
        )
        if status and status.lower() != "all":
            query = query.filter(Package.status == status)
        return query.order_by(Package.created_at.desc()).offset(skip).limit(limit).all()

    def get_secretary_by_id(self, secretary_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.id == secretary_id).first()

    def get_secretary_by_user_id(self, user_id: int) -> Optional[Secretary]:
        return self.db.query(Secretary).filter(Secretary.user_id == user_id).first()

    def get_trip_by_id(self, trip_id: int) -> Optional[Trip]:
        return self.db.query(Trip).filter(Trip.id == trip_id).first()

    def create_package(self, package: Package) -> Package:
        self.db.add(package)
        self.db.flush()
        return package

    def create_item(self, item: PackageItem) -> PackageItem:
        self.db.add(item)
        self.db.flush()
        return item

    def get_items(self, package_id: int) -> list[PackageItem]:
        return (
            self.db.query(PackageItem)
            .filter(PackageItem.package_id == package_id)
            .all()
        )

    def get_item_by_id(self, item_id: int) -> Optional[PackageItem]:
        return self.db.query(PackageItem).filter(PackageItem.id == item_id).first()

    def count_items(self, package_id: int) -> int:
        return (
            self.db.query(PackageItem)
            .filter(PackageItem.package_id == package_id)
            .count()
        )

    def delete_item(self, item: PackageItem) -> None:
        self.db.delete(item)
        self.db.flush()

    def delete_package(self, package: Package) -> None:
        self.db.delete(package)
        self.db.flush()

    def get_cash_transaction_by_reference(
        self, reference_type: str, reference_id: int, tx_type=None
    ) -> Optional[CashTransaction]:
        query = self.db.query(CashTransaction).filter(
            CashTransaction.reference_type == reference_type,
            CashTransaction.reference_id == reference_id,
        )
        if tx_type is not None:
            query = query.filter(CashTransaction.type == tx_type)
        return query.first()

    def get_cash_balance_for_package(self, package_id: int) -> float:
        """Sum of all cash transaction amounts tied to this package.

        Includes the original PACKAGE_PAYMENT and any ADJUSTMENT created by
        edits or cancellations (reference_type starts with 'package').
        Returns the net effective cash currently in the registers for this
        package — used to compute correct reversals.
        """
        rows = (
            self.db.query(CashTransaction.amount)
            .filter(
                CashTransaction.reference_id == package_id,
                CashTransaction.reference_type.like("package%"),
            )
            .all()
        )
        return float(sum(r[0] for r in rows) or 0.0)

    def search_packages(
        self, term: str, skip: int = 0, limit: int = 100
    ) -> list[Package]:
        Sender = aliased(Client)
        Recipient = aliased(Client)
        search_term = f"%{term}%"

        query = (
            self.db.query(Package)
            .outerjoin(Sender, Package.sender_id == Sender.id)
            .outerjoin(Recipient, Package.recipient_id == Recipient.id)
            .outerjoin(Package.items)
            .filter(
                or_(
                    Package.tracking_number.ilike(search_term),
                    Sender.firstname.ilike(search_term),
                    Sender.lastname.ilike(search_term),
                    Recipient.firstname.ilike(search_term),
                    Recipient.lastname.ilike(search_term),
                    PackageItem.description.ilike(search_term),
                )
            )
            .options(
                joinedload(Package.sender),
                joinedload(Package.recipient),
                joinedload(Package.items),
                joinedload(Package.trip).joinedload(Trip.route).joinedload(Route.origin_location),
                joinedload(Package.trip).joinedload(Trip.route).joinedload(Route.destination_location),
                joinedload(Package.origin_office),
                joinedload(Package.destination_office),
            )
            .distinct()
        )

        return query.order_by(Package.created_at.desc()).offset(skip).limit(limit).all()

    def get_packages_by_trip_and_status(
        self, trip_id: int, status: str
    ) -> list[Package]:
        return (
            self.db.query(Package)
            .filter(Package.trip_id == trip_id, Package.status == status)
            .all()
        )

    def get_packages_by_trip(self, trip_id: int) -> list[Package]:
        return self.db.query(Package).filter(Package.trip_id == trip_id).all()
