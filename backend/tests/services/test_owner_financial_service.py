import pytest
from unittest.mock import MagicMock
from services.owner_financial_service import OwnerFinancialService
from core.exceptions import NotFoundException, ValidationException


def test_get_owner_trips_financials_not_found():
    db_mock = MagicMock()
    db_mock.query().filter().first.return_value = None
    service = OwnerFinancialService(db_mock)

    with pytest.raises(NotFoundException):
        service.get_owner_trips_financials(999)


def test_get_owner_trips_financials_empty():
    db_mock = MagicMock()
    owner_mock = MagicMock()
    owner_mock.id = 1
    owner_mock.buses = []
    db_mock.query().filter().first.return_value = owner_mock

    service = OwnerFinancialService(db_mock)
    result = service.get_owner_trips_financials(1)

    assert result == []


def test_get_owner_trips_financials_with_collected_packages():
    db_mock = MagicMock()

    owner_mock = MagicMock()
    owner_mock.id = 1
    bus_mock = MagicMock()
    bus_mock.id = 10
    owner_mock.buses = [bus_mock]

    trip_mock = MagicMock()
    trip_mock.id = 100
    trip_mock.trip_datetime = MagicMock()
    trip_mock.route = MagicMock()
    trip_mock.route.origin_location.name = "Origen"
    trip_mock.route.destination_location.name = "Destino"
    trip_mock.bus = bus_mock
    trip_mock.bus.license_plate = "ABC-123"

    pkg_paid = MagicMock()
    pkg_paid.payment_status = "paid_on_send"
    pkg_paid.total_price = 100.0
    pkg_paid.status = "delivered"

    pkg_collected = MagicMock()
    pkg_collected.payment_status = "collect_on_delivery"
    pkg_collected.status = "delivered"
    pkg_collected.total_price = 150.0
    dest_office = MagicMock()
    dest_office.name = "Oficina Destino"
    pkg_collected.destination_office = dest_office
    pkg_collected.tracking_number = "ENC-000001"

    pkg_pending = MagicMock()
    pkg_pending.payment_status = "collect_on_delivery"
    pkg_pending.status = "arrived_at_destination"
    pkg_pending.total_price = 200.0

    def mock_query_filter_side_effect(*args, **kwargs):
        return db_mock.query.return_value

    query_mock = MagicMock()
    db_mock.query.return_value = query_mock
    query_mock.filter.return_value = query_mock
    query_mock.first.return_value = owner_mock
    query_mock.all.return_value = [trip_mock]

    call_count = [0]

    def query_side_effect(model):
        call_count[0] += 1
        q = MagicMock()
        if call_count[0] == 1:
            q.filter.return_value.first.return_value = owner_mock
            return q
        elif call_count[0] == 2:
            q.filter.return_value.all.return_value = [trip_mock]
            return q
        elif call_count[0] == 3:
            q.filter.return_value.all.return_value = []
            return q
        elif call_count[0] == 4:
            q.filter.return_value.all.return_value = [
                pkg_paid,
                pkg_collected,
                pkg_pending,
            ]
            return q
        elif call_count[0] == 5:
            q.filter.return_value.all.return_value = []
            return q
        else:
            q.filter.return_value.all.return_value = []
            return q

    db_mock.query.side_effect = query_side_effect

    service = OwnerFinancialService(db_mock)
    result = service.get_owner_trips_financials(1)

    assert len(result) == 1
    assert result[0]["packages_paid_amount"] == 100.0
    assert result[0]["packages_collected_at_destination"] == 150.0
    assert result[0]["packages_pending_amount"] == 200.0
    assert result[0]["total_collected"] == 250.0
    assert len(result[0]["collected_packages_details"]) == 1
    assert (
        result[0]["collected_packages_details"][0]["collected_at_office"]
        == "Oficina Destino"
    )
