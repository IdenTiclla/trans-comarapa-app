"""Pure unit tests for FinancialSummaryService - no database required."""

import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from datetime import date, datetime

from services.financial_summary_service import FinancialSummaryService
from core.enums import CashRegisterStatus, CashTransactionType


def _make_service(mock_db):
    service = FinancialSummaryService(mock_db)
    return service


def _make_office(id=1, name="Oficina Central"):
    office = MagicMock()
    office.id = id
    office.name = name
    return office


def _make_register(
    id=1, office_id=1, status=CashRegisterStatus.OPEN, initial_balance=100.0
):
    reg = MagicMock()
    reg.id = id
    reg.office_id = office_id
    reg.status = status
    reg.initial_balance = initial_balance
    reg.date = date.today()
    return reg


@pytest.mark.unit
class TestOfficesFinancialSummary:
    def test_multiple_offices_with_registers(self, mock_db):
        service = _make_service(mock_db)

        offices = [_make_office(1, "Oficina A"), _make_office(2, "Oficina B")]
        reg_a = _make_register(id=1, office_id=1, initial_balance=200.0)
        reg_b = _make_register(id=2, office_id=2, initial_balance=300.0)

        # Setup chained query mocks
        query_offices = MagicMock()
        query_register = MagicMock()
        query_totals = MagicMock()

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                # Office query
                return query_offices
            # CashRegister or CashTransaction queries
            return query_register

        mock_db.query.side_effect = query_side_effect
        query_offices.all.return_value = offices

        # Register queries - return registers for each office filter
        register_results = [reg_a, reg_b]
        register_call_count = [0]

        def filter_side_effect(*args, **kwargs):
            return query_register

        query_register.filter.side_effect = filter_side_effect

        def first_side_effect():
            register_call_count[0] += 1
            if register_call_count[0] <= len(register_results):
                return register_results[register_call_count[0] - 1]
            return None

        query_register.first.side_effect = first_side_effect

        # Mock _calculate_totals to avoid complex query chain
        with patch.object(service, "_calculate_totals") as mock_calc:
            mock_calc.side_effect = [(150.0, 50.0), (200.0, 100.0)]

            result = service.get_offices_financial_summary(date.today())

        assert len(result["offices"]) == 2
        assert result["offices"][0]["office_name"] == "Oficina A"
        assert result["offices"][1]["office_name"] == "Oficina B"
        assert result["totals"]["total_in"] == 350.0
        assert result["totals"]["total_out"] == 150.0

    def test_office_without_register(self, mock_db):
        service = _make_service(mock_db)

        offices = [_make_office(1, "Oficina A")]

        query_offices = MagicMock()
        query_register = MagicMock()

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_offices
            return query_register

        mock_db.query.side_effect = query_side_effect
        query_offices.all.return_value = offices
        query_register.filter.return_value = query_register
        query_register.first.return_value = None

        result = service.get_offices_financial_summary(date.today())

        assert len(result["offices"]) == 1
        assert result["offices"][0]["status"] == "no_register"
        assert result["offices"][0]["available_cash"] == 0.0
        assert result["totals"]["total_available"] == 0.0


@pytest.mark.unit
class TestWithdrawalHistory:
    def test_returns_formatted_withdrawals(self, mock_db):
        service = _make_service(mock_db)

        row = MagicMock()
        row.id = 1
        row.date = date.today()
        row.office_id = 1
        row.office_name = "Oficina A"
        row.amount = 150.0
        row.description = "Retiro por Juan Perez: Gastos varios"
        row.created_at = datetime(2026, 3, 13, 10, 0, 0)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.order_by.return_value = query_mock
        query_mock.all.return_value = [row]

        result = service.get_withdrawal_history()

        assert len(result) == 1
        assert result[0]["amount"] == 150.0
        assert result[0]["registered_by"] == "Juan Perez"
        assert result[0]["office_name"] == "Oficina A"

    def test_filters_by_office_and_date(self, mock_db):
        service = _make_service(mock_db)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.order_by.return_value = query_mock
        query_mock.all.return_value = []

        result = service.get_withdrawal_history(
            office_id=1,
            date_from=date(2026, 3, 1),
            date_to=date(2026, 3, 13),
        )

        assert result == []
        # filter should be called multiple times (type + office + date_from + date_to)
        assert query_mock.filter.call_count >= 3


@pytest.mark.unit
class TestGetCashSummary:
    def test_cash_summary_with_open_register(self, mock_db):
        service = _make_service(mock_db)
        reg = _make_register(status=CashRegisterStatus.OPEN, initial_balance=500.0)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.all.return_value = [reg]

        with patch.object(service, "_calculate_totals") as mock_calc:
            mock_calc.return_value = (300.0, 50.0)

            result = service.get_cash_summary(date.today())

        assert result["total_income_today"] == 300.0
        assert result["total_withdrawals_today"] == 50.0
        assert result["registers_open"] == 1
        assert result["total_available"] == 750.0  # 500 + 300 - 50


@pytest.mark.unit
class TestGetCollectionsByOffice:
    def test_returns_collections_grouped_by_office(self, mock_db):
        service = _make_service(mock_db)

        row1 = MagicMock()
        row1.office_id = 1
        row1.office_name = "Oficina Central"
        row1.total_collected = 250.0
        row1.transactions_count = 5

        row2 = MagicMock()
        row2.office_id = 2
        row2.office_name = "Oficina Sucursal"
        row2.total_collected = 180.0
        row2.transactions_count = 3

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.group_by.return_value = query_mock
        query_mock.order_by.return_value = query_mock
        query_mock.all.return_value = [row1, row2]

        result = service.get_collections_by_office(date.today())

        assert len(result) == 2
        assert result[0]["office_name"] == "Oficina Central"
        assert result[0]["total_collected"] == 250.0
        assert result[0]["transactions_count"] == 5
        assert result[1]["office_name"] == "Oficina Sucursal"
        assert result[1]["total_collected"] == 180.0

    def test_returns_empty_list_when_no_collections(self, mock_db):
        service = _make_service(mock_db)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.group_by.return_value = query_mock
        query_mock.order_by.return_value = query_mock
        query_mock.all.return_value = []

        result = service.get_collections_by_office(date.today())

        assert result == []

    def test_handles_null_amounts(self, mock_db):
        service = _make_service(mock_db)

        row = MagicMock()
        row.office_id = 1
        row.office_name = "Oficina Central"
        row.total_collected = None
        row.transactions_count = 0

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.group_by.return_value = query_mock
        query_mock.order_by.return_value = query_mock
        query_mock.all.return_value = [row]

        result = service.get_collections_by_office(date.today())

        assert len(result) == 1
        assert result[0]["total_collected"] == 0.0
