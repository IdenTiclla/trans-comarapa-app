import pytest
from unittest.mock import MagicMock
from services.owner_financial_service import OwnerFinancialService
from core.exceptions import NotFoundException, ValidationException


def _make_owner(id=1, bus_ids=None):
    owner = MagicMock()
    owner.id = id
    buses = []
    for bid in bus_ids or []:
        b = MagicMock()
        b.id = bid
        buses.append(b)
    owner.buses = buses
    return owner


def _make_trip(id=1, bus_id=1):
    trip = MagicMock()
    trip.id = id
    trip.bus_id = bus_id
    trip.trip_datetime = f"2025-01-{id:02d}T10:00:00"
    route = MagicMock()
    route.origin_location = MagicMock(name="Origin")
    route.origin_location.name = "Santa Cruz"
    route.destination_location = MagicMock(name="Dest")
    route.destination_location.name = "Cochabamba"
    trip.route = route
    trip.bus = MagicMock()
    trip.bus.license_plate = "ABC-123"
    return trip


def _make_withdrawal(id=1, owner_id=1, trip_id=1, cash_transaction_id=10):
    w = MagicMock()
    w.id = id
    w.owner_id = owner_id
    w.trip_id = trip_id
    w.cash_transaction_id = cash_transaction_id
    w.created_at = None
    w.trip = _make_trip(id=trip_id)
    return w


def _make_cash_transaction(id=10, amount=500.0, office_name="Oficina Central"):
    ct = MagicMock()
    ct.id = id
    ct.amount = amount
    ct.cash_register = MagicMock()
    ct.cash_register.office = MagicMock()
    ct.cash_register.office.name = office_name
    ct.cash_register.office_id = 1
    return ct


def _setup_service(mock_db):
    return OwnerFinancialService(mock_db)


@pytest.mark.unit
class TestGetOwnerTripsFinancialsBusId:
    def test_no_bus_id_returns_all_trips(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10, 20])
        trip1 = _make_trip(id=100, bus_id=10)
        trip2 = _make_trip(id=200, bus_id=20)

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        query_trips = MagicMock()
        query_trips.filter.return_value.all.return_value = [trip1, trip2]

        query_tickets = MagicMock()
        query_tickets.filter.return_value.all.return_value = []

        query_packages = MagicMock()
        query_packages.filter.return_value.all.return_value = []

        query_withdrawals = MagicMock()
        query_withdrawals.filter.return_value.all.return_value = []

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_owner
            if call_count[0] == 2:
                return query_trips
            if call_count[0] % 3 == 0:
                return query_tickets
            if call_count[0] % 3 == 1:
                return query_packages
            return query_withdrawals

        mock_db.query.side_effect = query_side_effect
        service = _setup_service(mock_db)
        result = service.get_owner_trips_financials(1)
        assert len(result) == 2

    def test_bus_id_filters_to_single_bus(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10, 20])
        trip_a = _make_trip(id=100, bus_id=10)

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        query_trips = MagicMock()
        query_trips.filter.return_value.all.return_value = [trip_a]

        query_tickets = MagicMock()
        query_tickets.filter.return_value.all.return_value = []

        query_packages = MagicMock()
        query_packages.filter.return_value.all.return_value = []

        query_withdrawals = MagicMock()
        query_withdrawals.filter.return_value.all.return_value = []

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_owner
            if call_count[0] == 2:
                return query_trips
            if call_count[0] % 3 == 0:
                return query_tickets
            if call_count[0] % 3 == 1:
                return query_packages
            return query_withdrawals

        mock_db.query.side_effect = query_side_effect
        service = _setup_service(mock_db)
        result = service.get_owner_trips_financials(1, bus_id=10)
        assert len(result) == 1
        assert result[0]["trip_id"] == 100

    def test_bus_id_not_owned_raises(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10])

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        mock_db.query.return_value.filter.return_value.first.return_value = owner
        service = _setup_service(mock_db)
        with pytest.raises(ValidationException, match="no pertenece"):
            service.get_owner_trips_financials(1, bus_id=999)

    def test_owner_not_found_raises(self, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        service = _setup_service(mock_db)
        with pytest.raises(NotFoundException):
            service.get_owner_trips_financials(999)


@pytest.mark.unit
class TestGetOwnerWithdrawals:
    def test_returns_withdrawals_list(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10])
        w = _make_withdrawal(id=1, owner_id=1, trip_id=100)
        ct = _make_cash_transaction(id=10, amount=500.0, office_name="Oficina A")

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        query_w = MagicMock()
        query_w.filter.return_value.order_by.return_value.all.return_value = [w]

        query_ct = MagicMock()
        query_ct.filter.return_value.first.return_value = ct

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_owner
            if call_count[0] == 2:
                return query_w
            return query_ct

        mock_db.query.side_effect = query_side_effect
        service = _setup_service(mock_db)
        result = service.get_owner_withdrawals(1)
        assert len(result) == 1
        assert result[0]["amount"] == 500.0
        assert result[0]["office_name"] == "Oficina A"
        assert result[0]["status"] == "PROCESSED"

    def test_filters_by_bus_id(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10, 20])
        trip = _make_trip(id=100, bus_id=10)

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        query_trips = MagicMock()
        query_trips.filter.return_value.all.return_value = [trip]

        query_w = MagicMock()
        query_w.filter.return_value.filter.return_value.order_by.return_value.all.return_value = []

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_owner
            if call_count[0] == 2:
                return query_trips
            return query_w

        mock_db.query.side_effect = query_side_effect
        service = _setup_service(mock_db)
        result = service.get_owner_withdrawals(1, bus_id=10)
        assert result == []

    def test_bus_id_not_owned_raises(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10])

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        mock_db.query.return_value.filter.return_value.first.return_value = owner
        service = _setup_service(mock_db)
        with pytest.raises(ValidationException, match="no pertenece"):
            service.get_owner_withdrawals(1, bus_id=999)

    def test_owner_not_found_raises(self, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        service = _setup_service(mock_db)
        with pytest.raises(NotFoundException):
            service.get_owner_withdrawals(999)

    def test_no_trips_for_bus_returns_empty(self, mock_db):
        owner = _make_owner(id=1, bus_ids=[10, 20])

        query_owner = MagicMock()
        query_owner.filter.return_value.first.return_value = owner

        query_trips = MagicMock()
        query_trips.filter.return_value.all.return_value = []

        call_count = [0]

        def query_side_effect(model):
            call_count[0] += 1
            if call_count[0] == 1:
                return query_owner
            return query_trips

        mock_db.query.side_effect = query_side_effect
        service = _setup_service(mock_db)
        result = service.get_owner_withdrawals(1, bus_id=20)
        assert result == []
