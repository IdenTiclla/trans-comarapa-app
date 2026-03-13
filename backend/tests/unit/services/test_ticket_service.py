"""Pure unit tests for TicketService - no database required."""

import pytest
from unittest.mock import create_autospec, MagicMock

from services.ticket_service import TicketService
from repositories.ticket_repository import TicketRepository
from services.seat_lock_service import SeatLockService
from tests.factories import TicketFactory


@pytest.mark.unit
class TestTicketServiceCancel:
    """Test TicketService.cancel_ticket in isolation."""

    def test_cancel_pending_ticket_succeeds(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="pending")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        result = service.cancel_ticket(ticket.id)

        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_called_once()
        mock_db.commit.assert_called()

    def test_cancel_already_cancelled_skips_transition(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="cancelled")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        result = service.cancel_ticket(ticket.id)

        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_not_called()
        mock_db.commit.assert_not_called()


@pytest.mark.unit
class TestTicketServiceGetById:
    """Test TicketService.get_by_id in isolation."""

    def test_get_by_id_delegates_to_repository(self, mock_db):
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="pending")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        result = service.get_by_id(ticket.id)

        assert result == ticket
        mock_repo.get_by_id_or_raise.assert_called_once_with(ticket.id, "Ticket")
