from typing import Optional, List

from sqlalchemy.orm import Session

from models.owner import Owner
from models.owner_withdrawal import OwnerWithdrawal
from models.cash_transaction import CashTransaction
from models.trip import Trip
from repositories.base import BaseRepository


class OwnerRepository(BaseRepository[Owner]):
    def __init__(self, db: Session):
        super().__init__(Owner, db)

    def get_all_owners(self, skip: int = 0, limit: int = 100) -> List[Owner]:
        return self.db.query(Owner).offset(skip).limit(limit).all()

    def get_by_id_or_none(self, owner_id: int) -> Optional[Owner]:
        return self.db.query(Owner).filter(Owner.id == owner_id).first()

    def get_trips_by_bus_ids(self, bus_ids: List[int]) -> List[Trip]:
        return self.db.query(Trip).filter(Trip.bus_id.in_(bus_ids)).all()

    def get_withdrawals_by_owner(
        self, owner_id: int, trip_ids: Optional[List[int]] = None
    ) -> List[OwnerWithdrawal]:
        query = self.db.query(OwnerWithdrawal).filter(
            OwnerWithdrawal.owner_id == owner_id
        )
        if trip_ids:
            query = query.filter(OwnerWithdrawal.trip_id.in_(trip_ids))
        return query.order_by(OwnerWithdrawal.created_at.desc()).all()

    def get_cash_transaction(self, transaction_id: int) -> Optional[CashTransaction]:
        return (
            self.db.query(CashTransaction)
            .filter(CashTransaction.id == transaction_id)
            .first()
        )

    def create_withdrawal(self, withdrawal: OwnerWithdrawal) -> OwnerWithdrawal:
        self.db.add(withdrawal)
        self.db.flush()
        return withdrawal

    def get_trips_by_bus_id(self, bus_id: int) -> List[Trip]:
        return self.db.query(Trip).filter(Trip.bus_id == bus_id).all()
