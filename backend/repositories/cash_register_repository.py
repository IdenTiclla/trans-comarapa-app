from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from repositories.base import BaseRepository
from models.cash_register import CashRegister
from models.cash_transaction import CashTransaction
from core.enums import CashRegisterStatus

class CashRegisterRepository(BaseRepository[CashRegister]):
    def __init__(self, db: Session):
        super().__init__(CashRegister, db)
    
    def get_open_register_by_office(self, office_id: int) -> Optional[CashRegister]:
        """Gets the currently open cash register for a specific office."""
        return self.db.query(CashRegister).filter(
            CashRegister.office_id == office_id,
            CashRegister.status == CashRegisterStatus.OPEN
        ).first()
        
    def get_register_by_date(self, office_id: int, target_date: date) -> Optional[CashRegister]:
        """Gets the cash register for a specific office and date."""
        return self.db.query(CashRegister).filter(
            CashRegister.office_id == office_id,
            CashRegister.date == target_date
        ).first()

    def get_transactions(self, register_id: int) -> List[CashTransaction]:
        """Gets all transactions for a specific cash register."""
        return self.db.query(CashTransaction).filter(
            CashTransaction.cash_register_id == register_id
        ).order_by(CashTransaction.created_at.desc()).all()

    def create_transaction(self, transaction_data: dict) -> CashTransaction:
        """Creates a new cash transaction."""
        transaction = CashTransaction(**transaction_data)
        self.db.add(transaction)
        self.db.flush()
        return transaction
        
    def calculate_total_in_out(self, register_id: int) -> tuple[float, float]:
        """
        Calculates total money in and out for a given register based on related transactions.
        Only considers transactions made through CASH.
        Returns (total_in, total_out)
        """
        from core.enums import PaymentMethod, CashTransactionType
        
        # Determine which transaction types add or subtract cash
        # Assuming ticket sales and por_cobrar collections are INs
        # Adjustments could be positive/negative or we only use withdrawal for OUTs
        # For simplicity, let's treat TICKET_SALE, PACKAGE_PAYMENT (paid on send), POR_COBRAR_COLLECTION as IN
        # WITHDRAWAL as OUT, ADJUSTMENT based on amount (positive=in, negative=out)
        
        in_types = [
            CashTransactionType.TICKET_SALE, 
            CashTransactionType.PACKAGE_PAYMENT, 
            CashTransactionType.POR_COBRAR_COLLECTION
        ]
        
        out_types = [CashTransactionType.WITHDRAWAL]
        
        # Calculate total IN (cash)
        total_in = self.db.query(func.sum(CashTransaction.amount)).filter(
            CashTransaction.cash_register_id == register_id,
            CashTransaction.payment_method == PaymentMethod.CASH,
            CashTransaction.type.in_(in_types)
        ).scalar() or 0.0
        
        # Calculate total OUT (cash)
        total_out = self.db.query(func.sum(CashTransaction.amount)).filter(
            CashTransaction.cash_register_id == register_id,
            CashTransaction.payment_method == PaymentMethod.CASH,
            CashTransaction.type.in_(out_types)
        ).scalar() or 0.0
        
        # Adjustments are separated to handle signs natively, assuming positive=in, negative=out
        adjustments = self.db.query(func.sum(CashTransaction.amount)).filter(
            CashTransaction.cash_register_id == register_id,
            CashTransaction.payment_method == PaymentMethod.CASH,
            CashTransaction.type == CashTransactionType.ADJUSTMENT
        ).scalar() or 0.0
        
        if adjustments > 0:
            total_in += adjustments
        else:
            total_out += abs(adjustments)

        return total_in, total_out
