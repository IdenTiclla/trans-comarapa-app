"""Pure unit tests for PackageService - no database required."""

from typing import Optional
import pytest
from unittest.mock import MagicMock, patch

from services.package_service import PackageService
from repositories.package_repository import PackageRepository


class MockSecretary:
    def __init__(self, id: int = 1, office_id: int = 2):
        self.id = id
        self.office_id = office_id


class MockPackage:
    def __init__(
        self,
        id: int = 1,
        tracking_number: str = "ENC-000001",
        status: str = "arrived_at_destination",
        payment_status: str = "collect_on_delivery",
        destination_office_id: Optional[int] = 2,
        total_price: float = 150.0,
    ):
        self.id = id
        self.tracking_number = tracking_number
        self.status = status
        self.payment_status = payment_status
        self.destination_office_id = destination_office_id
        self.total_price = total_price
        self.items = [MagicMock(total_price=150.0)]


@pytest.mark.unit
class TestDeliverPackageOfficeValidation:
    def test_logs_warning_when_secretary_office_mismatch(self, mock_db):
        mock_repo = MagicMock(spec=PackageRepository)
        pkg = MockPackage(destination_office_id=2)
        mock_repo.get_by_id_eager.return_value = pkg

        secretary = MockSecretary(id=1, office_id=3)

        service = PackageService(mock_db, repo=mock_repo)

        mock_cash_service = MagicMock()
        mock_register = MagicMock()
        mock_cash_service.get_current_register.return_value = mock_register

        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = secretary
        mock_db.query.return_value = query_mock

        with (
            patch(
                "services.cash_register_service.CashRegisterService",
                return_value=mock_cash_service,
            ),
            patch(
                "services.package_service.validate_transition",
                return_value=True,
            ),
            patch("services.package_service.logger") as mock_logger,
        ):
            service.deliver_package(
                package_id=1,
                payment_method="cash",
                changed_by_user_id=10,
            )

        mock_logger.warning.assert_called_once()
        warning_call = mock_logger.warning.call_args[0]
        assert (
            "oficina destino" in warning_call[0].lower()
            or "distinta" in warning_call[0].lower()
        )

    def test_no_warning_when_secretary_office_matches(self, mock_db):
        mock_repo = MagicMock(spec=PackageRepository)
        pkg = MockPackage(destination_office_id=2)
        mock_repo.get_by_id_eager.return_value = pkg

        secretary = MockSecretary(id=1, office_id=2)

        service = PackageService(mock_db, repo=mock_repo)

        mock_cash_service = MagicMock()
        mock_register = MagicMock()
        mock_cash_service.get_current_register.return_value = mock_register

        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = secretary
        mock_db.query.return_value = query_mock

        with (
            patch(
                "services.cash_register_service.CashRegisterService",
                return_value=mock_cash_service,
            ),
            patch(
                "services.package_service.validate_transition",
                return_value=True,
            ),
            patch("services.package_service.logger") as mock_logger,
        ):
            service.deliver_package(
                package_id=1,
                payment_method="cash",
                changed_by_user_id=10,
            )

        mock_logger.warning.assert_not_called()

    def test_no_warning_when_no_destination_office(self, mock_db):
        mock_repo = MagicMock(spec=PackageRepository)
        pkg = MockPackage(destination_office_id=None)
        mock_repo.get_by_id_eager.return_value = pkg

        secretary = MockSecretary(id=1, office_id=5)

        service = PackageService(mock_db, repo=mock_repo)

        mock_cash_service = MagicMock()
        mock_register = MagicMock()
        mock_cash_service.get_current_register.return_value = mock_register

        query_mock = MagicMock()
        query_mock.filter.return_value.first.return_value = secretary
        mock_db.query.return_value = query_mock

        with (
            patch(
                "services.cash_register_service.CashRegisterService",
                return_value=mock_cash_service,
            ),
            patch(
                "services.package_service.validate_transition",
                return_value=True,
            ),
            patch("services.package_service.logger") as mock_logger,
        ):
            service.deliver_package(
                package_id=1,
                payment_method="cash",
                changed_by_user_id=10,
            )

        mock_logger.warning.assert_not_called()
