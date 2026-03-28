"""Pure unit tests for cancel+reversal logic in TicketService and PackageService."""

import pytest
from unittest.mock import create_autospec, MagicMock, patch

from services.ticket_service import TicketService
from services.package_service import PackageService
from repositories.ticket_repository import TicketRepository
from repositories.package_repository import PackageRepository
from tests.factories import TicketFactory


def _make_package(id=1, status="registered", secretary_id=1):
    pkg = MagicMock()
    pkg.id = id
    pkg.status = status
    pkg.secretary_id = secretary_id
    return pkg


@pytest.mark.unit
class TestTicketCancelReversal:
    """Test cancel_ticket creates ADJUSTMENT transaction when applicable."""

    def test_cancel_ticket_with_reversal_called(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="confirmed", secretary_id=1)
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        # Mock _create_reversal_if_applicable to verify it gets called
        with patch.object(service, '_create_reversal_if_applicable') as mock_reversal:
            result = service.cancel_ticket(ticket.id)

            assert result.state == "cancelled"
            mock_repo.log_state_change.assert_called_once()
            mock_reversal.assert_called_once_with(ticket)

    def test_cancel_ticket_without_transaction_no_reversal(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="confirmed", secretary_id=1)
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.first.return_value = None  # No original transaction

        result = service.cancel_ticket(ticket.id)

        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_called_once()

    def test_cancel_already_cancelled_is_noop(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="cancelled")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        result = service.cancel_ticket(ticket.id)

        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_not_called()
        mock_db.commit.assert_not_called()


@pytest.mark.unit
class TestPackageCancelReversal:
    """Test cancel_package creates ADJUSTMENT transaction when applicable."""

    def test_cancel_package_with_reversal_called(self, mock_db):
        mock_repo = create_autospec(PackageRepository, instance=True)
        pkg = _make_package(status="registered", secretary_id=1)
        mock_repo.get_by_id_eager.return_value = pkg
        service = PackageService(mock_db, repo=mock_repo)

        with patch.object(service, '_create_reversal_if_applicable') as mock_reversal:
            result = service.cancel_package(pkg.id)

            assert result.status == "cancelled"
            mock_repo.log_state_change.assert_called_once()
            mock_reversal.assert_called_once_with(pkg)

    def test_cancel_package_without_transaction_no_reversal(self, mock_db):
        mock_repo = create_autospec(PackageRepository, instance=True)
        pkg = _make_package(status="registered")
        mock_repo.get_by_id_eager.return_value = pkg
        service = PackageService(mock_db, repo=mock_repo)

        query_mock = MagicMock()
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = query_mock
        query_mock.first.return_value = None

        result = service.cancel_package(pkg.id)

        assert result.status == "cancelled"
        mock_repo.log_state_change.assert_called_once()

    def test_cancel_already_cancelled_package_is_noop(self, mock_db):
        mock_repo = create_autospec(PackageRepository, instance=True)
        pkg = _make_package(status="cancelled")
        mock_repo.get_by_id_eager.return_value = pkg
        service = PackageService(mock_db, repo=mock_repo)

        result = service.cancel_package(pkg.id)

        assert result.status == "cancelled"
        mock_repo.log_state_change.assert_not_called()
        mock_db.commit.assert_not_called()
