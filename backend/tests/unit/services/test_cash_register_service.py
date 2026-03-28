"""Pure unit tests for CashRegisterService - no database required."""

import pytest
from unittest.mock import create_autospec, MagicMock, patch
from datetime import date, datetime

from services.cash_register_service import CashRegisterService
from repositories.cash_register_repository import CashRegisterRepository
from repositories.office_repository import OfficeRepository
from core.enums import CashRegisterStatus, CashTransactionType, PaymentMethod
from core.exceptions import NotFoundException, ValidationException, ConflictException


def _make_service(mock_db, *, cash_repo=None, office_repo=None):
    service = CashRegisterService.__new__(CashRegisterService)
    service.db = mock_db
    service.cash_repo = cash_repo or create_autospec(CashRegisterRepository, instance=True)
    service.office_repo = office_repo or create_autospec(OfficeRepository, instance=True)
    return service


def _make_register(id=1, office_id=1, status=CashRegisterStatus.OPEN, initial_balance=100.0):
    reg = MagicMock()
    reg.id = id
    reg.office_id = office_id
    reg.status = status
    reg.initial_balance = initial_balance
    reg.date = date.today()
    reg.final_balance = None
    return reg


def _make_office(id=1, name="Oficina Central"):
    office = MagicMock()
    office.id = id
    office.name = name
    return office


def _make_user(id=1, firstname="Juan", lastname="Perez", username="jperez"):
    user = MagicMock()
    user.id = id
    user.firstname = firstname
    user.lastname = lastname
    user.username = username
    return user


@pytest.mark.unit
class TestOpenRegister:
    def test_open_register_happy_path(self, mock_db):
        service = _make_service(mock_db)
        service.office_repo.get_by_id.return_value = _make_office()
        service.cash_repo.get_open_register_by_office.return_value = None
        new_reg = _make_register()
        service.cash_repo.create.return_value = new_reg

        result = service.open_register(office_id=1, opened_by_id=1, initial_balance=100.0)

        assert result == new_reg
        service.cash_repo.create.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_open_register_already_open_raises_conflict(self, mock_db):
        service = _make_service(mock_db)
        service.office_repo.get_by_id.return_value = _make_office()
        service.cash_repo.get_open_register_by_office.return_value = _make_register()

        with pytest.raises(ConflictException):
            service.open_register(office_id=1, opened_by_id=1, initial_balance=100.0)

    def test_open_register_invalid_office_raises_not_found(self, mock_db):
        service = _make_service(mock_db)
        service.office_repo.get_by_id.return_value = None

        with pytest.raises(NotFoundException):
            service.open_register(office_id=999, opened_by_id=1, initial_balance=100.0)


@pytest.mark.unit
class TestCloseRegister:
    def test_close_register_happy_path(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(status=CashRegisterStatus.OPEN)
        service.cash_repo.get_by_id.return_value = register
        service.cash_repo.update.return_value = register

        result = service.close_register(register_id=1, closed_by_id=1, final_balance=200.0)

        service.cash_repo.update.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_close_register_not_found_raises(self, mock_db):
        service = _make_service(mock_db)
        service.cash_repo.get_by_id.return_value = None

        with pytest.raises(NotFoundException):
            service.close_register(register_id=999, closed_by_id=1, final_balance=200.0)

    def test_close_register_already_closed_raises(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(status=CashRegisterStatus.CLOSED)
        service.cash_repo.get_by_id.return_value = register

        with pytest.raises(ValidationException):
            service.close_register(register_id=1, closed_by_id=1, final_balance=200.0)


@pytest.mark.unit
class TestRecordWithdrawal:
    def test_withdrawal_happy_path(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(initial_balance=500.0)
        service.cash_repo.get_by_id.return_value = register
        service.cash_repo.calculate_total_in_out.return_value = (200.0, 100.0)
        tx = MagicMock()
        service.cash_repo.create_transaction.return_value = tx
        user = _make_user()

        result = service.record_withdrawal(register_id=1, amount=100.0, description="Gastos", user=user)

        assert result == tx
        service.cash_repo.create_transaction.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_withdrawal_exceeds_available_raises(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(initial_balance=100.0)
        service.cash_repo.get_by_id.return_value = register
        service.cash_repo.calculate_total_in_out.return_value = (0.0, 50.0)
        user = _make_user()

        with pytest.raises(ValidationException, match="excede"):
            service.record_withdrawal(register_id=1, amount=100.0, description="Gastos", user=user)

    def test_withdrawal_closed_register_raises(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(status=CashRegisterStatus.CLOSED)
        service.cash_repo.get_by_id.return_value = register
        user = _make_user()

        with pytest.raises(ValidationException):
            service.record_withdrawal(register_id=1, amount=50.0, description="Gastos", user=user)

    def test_withdrawal_not_found_raises(self, mock_db):
        service = _make_service(mock_db)
        service.cash_repo.get_by_id.return_value = None
        user = _make_user()

        with pytest.raises(NotFoundException):
            service.record_withdrawal(register_id=999, amount=50.0, description="Gastos", user=user)


@pytest.mark.unit
class TestRecordTransaction:
    def test_record_transaction_happy_path(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register()
        service.cash_repo.get_by_id.return_value = register
        tx = MagicMock()
        service.cash_repo.create_transaction.return_value = tx

        data = MagicMock()
        data.cash_register_id = 1
        data.model_dump.return_value = {"cash_register_id": 1, "type": "ticket_sale", "amount": 50}

        result = service.record_transaction(data)

        assert result == tx
        mock_db.commit.assert_called_once()

    def test_record_transaction_closed_register_raises(self, mock_db):
        service = _make_service(mock_db)
        register = _make_register(status=CashRegisterStatus.CLOSED)
        service.cash_repo.get_by_id.return_value = register

        data = MagicMock()
        data.cash_register_id = 1

        with pytest.raises(ValidationException, match="closed"):
            service.record_transaction(data)
