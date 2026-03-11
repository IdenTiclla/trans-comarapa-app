from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.orm import Session

from core.exceptions import NotFoundException, ValidationException, ConflictException
from core.enums import CashRegisterStatus
from schemas.cash_register import CashRegisterCreate, CashTransactionCreate
from repositories.cash_register_repository import CashRegisterRepository
from repositories.office_repository import OfficeRepository
from models.cash_register import CashRegister

class CashRegisterService:
    def __init__(self, db: Session):
        self.db = db
        self.cash_repo = CashRegisterRepository(db)
        self.office_repo = OfficeRepository(db)
        
    def _validate_office(self, office_id: int):
        office = self.office_repo.get_by_id(office_id)
        if not office:
            raise NotFoundException(f"Office with id {office_id} not found")
        return office
        
    def get_current_register(self, office_id: int):
        """Returns the currently open register for an office, or None if there isn't one."""
        self._validate_office(office_id)
        return self.cash_repo.get_open_register_by_office(office_id)
        
    def open_register(self, office_id: int, opened_by_id: int, initial_balance: float):
        """Opens a new cash register for the day."""
        self._validate_office(office_id)
        
        # Check if there is already an open register
        current = self.cash_repo.get_open_register_by_office(office_id)
        if current:
            raise ConflictException(f"Office {office_id} already has an open cash register (ID {current.id})")
            
        today = date.today()
        # You could potentially allow multiple registers per day (one after another) 
        # but let's just make sure there isn't an OPEN one, which we just checked.
        
        register_obj = CashRegister(**{
            "office_id": office_id,
            "date": today,
            "opened_by_id": opened_by_id,
            "initial_balance": initial_balance,
            "status": CashRegisterStatus.OPEN,
            "opened_at": datetime.now()
        })
        
        register = self.cash_repo.create(register_obj)
        self.db.commit()
        return register
        
    def close_register(self, register_id: int, closed_by_id: int, final_balance: float):
        """Closes an open cash register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")
            
        if register.status == CashRegisterStatus.CLOSED:
            raise ValidationException("Cash register is already closed")
            
        update_data = {
            "closed_by_id": closed_by_id,
            "final_balance": final_balance,
            "status": CashRegisterStatus.CLOSED,
            "closed_at": datetime.now()
        }
        
        updated = self.cash_repo.update(register, update_data)
        self.db.commit()
        return updated
        
    def record_transaction(self, data: CashTransactionCreate):
        """Records a new cash transaction manually or automatically."""
        # Ensure register is valid and open
        register = self.cash_repo.get_by_id(data.cash_register_id)
        if not register:
            raise NotFoundException(f"Cash register {data.cash_register_id} not found")
            
        if register.status == CashRegisterStatus.CLOSED:
            raise ValidationException("Cannot record transactions on a closed cash register")
            
        transaction = self.cash_repo.create_transaction(data.model_dump())
        self.db.commit()
        return transaction

    def get_register_transactions(self, register_id: int):
        """Retrieves all transactions for a register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")
        return self.cash_repo.get_transactions(register_id)
        
    def get_daily_summary(self, register_id: int):
        """Calculates the summary for the given register."""
        register = self.cash_repo.get_by_id(register_id)
        if not register:
            raise NotFoundException(f"Cash register {register_id} not found")
            
        total_in, total_out = self.cash_repo.calculate_total_in_out(register_id)
        expected_balance = register.initial_balance + total_in - total_out
        
        transactions = self.cash_repo.get_transactions(register_id)
        
        type_summary = {}
        method_summary = {}
        for t in transactions:
            t_type = t.type.value
            method = t.payment_method.value
            type_summary[t_type] = type_summary.get(t_type, 0.0) + t.amount
            method_summary[method] = method_summary.get(method, 0.0) + t.amount
            
        return {
            "office_id": register.office_id,
            "date": register.date,
            "initial_balance": register.initial_balance,
            "final_balance": register.final_balance,
            "total_in": total_in,
            "total_out": total_out,
            "expected_balance": expected_balance,
            "is_closed": register.status == CashRegisterStatus.CLOSED,
            "transactions_by_type": type_summary,
            "transactions_by_method": method_summary
        }
