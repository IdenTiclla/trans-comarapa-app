"""
Unit tests for core/state_machines.py

Validates state transitions for tickets, packages, and trips.
"""

import pytest
from core.state_machines import (
    validate_transition,
    TICKET_TRANSITIONS,
    PACKAGE_TRANSITIONS,
    TRIP_TRANSITIONS,
)
from core.exceptions import InvalidStateTransitionException


class TestTicketStateMachine:
    """Tests for ticket state transitions."""

    def test_pending_to_confirmed(self):
        validate_transition("ticket", TICKET_TRANSITIONS, "pending", "confirmed")

    def test_pending_to_cancelled(self):
        validate_transition("ticket", TICKET_TRANSITIONS, "pending", "cancelled")

    def test_confirmed_to_completed(self):
        validate_transition("ticket", TICKET_TRANSITIONS, "confirmed", "completed")

    def test_confirmed_to_cancelled(self):
        validate_transition("ticket", TICKET_TRANSITIONS, "confirmed", "cancelled")

    def test_cancelled_is_terminal(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("ticket", TICKET_TRANSITIONS, "cancelled", "pending")

    def test_completed_is_terminal(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("ticket", TICKET_TRANSITIONS, "completed", "pending")

    def test_invalid_direct_pending_to_completed(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("ticket", TICKET_TRANSITIONS, "pending", "completed")


class TestPackageStateMachine:
    """Tests for package state transitions."""

    def test_registered_to_assigned(self):
        validate_transition("package", PACKAGE_TRANSITIONS, "registered_at_office", "assigned_to_trip")

    def test_assigned_to_in_transit(self):
        validate_transition("package", PACKAGE_TRANSITIONS, "assigned_to_trip", "in_transit")

    def test_assigned_to_unassigned(self):
        validate_transition("package", PACKAGE_TRANSITIONS, "assigned_to_trip", "registered_at_office")

    def test_in_transit_to_arrived(self):
        validate_transition("package", PACKAGE_TRANSITIONS, "in_transit", "arrived_at_destination")

    def test_arrived_to_delivered(self):
        validate_transition("package", PACKAGE_TRANSITIONS, "arrived_at_destination", "delivered")

    def test_delivered_is_terminal(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("package", PACKAGE_TRANSITIONS, "delivered", "registered_at_office")

    def test_skip_state_not_allowed(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("package", PACKAGE_TRANSITIONS, "registered_at_office", "in_transit")

    def test_backward_from_in_transit(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("package", PACKAGE_TRANSITIONS, "in_transit", "assigned_to_trip")


class TestTripStateMachine:
    """Tests for trip state transitions."""

    def test_scheduled_to_boarding(self):
        validate_transition("trip", TRIP_TRANSITIONS, "scheduled", "boarding")

    def test_scheduled_to_cancelled(self):
        validate_transition("trip", TRIP_TRANSITIONS, "scheduled", "cancelled")

    def test_boarding_to_departed(self):
        validate_transition("trip", TRIP_TRANSITIONS, "boarding", "departed")

    def test_departed_to_arrived(self):
        validate_transition("trip", TRIP_TRANSITIONS, "departed", "arrived")

    def test_arrived_is_terminal(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("trip", TRIP_TRANSITIONS, "arrived", "departed")

    def test_cancelled_is_terminal(self):
        with pytest.raises(InvalidStateTransitionException):
            validate_transition("trip", TRIP_TRANSITIONS, "cancelled", "scheduled")

    def test_delayed_to_boarding(self):
        validate_transition("trip", TRIP_TRANSITIONS, "delayed", "boarding")


class TestExceptionMessage:
    """Test that InvalidStateTransitionException provides useful messages."""

    def test_message_includes_states(self):
        with pytest.raises(InvalidStateTransitionException) as exc_info:
            validate_transition("ticket", TICKET_TRANSITIONS, "cancelled", "pending")
        assert "cancelled" in exc_info.value.message
        assert "pending" in exc_info.value.message
        assert "ticket" in exc_info.value.message

    def test_code_is_set(self):
        with pytest.raises(InvalidStateTransitionException) as exc_info:
            validate_transition("package", PACKAGE_TRANSITIONS, "delivered", "in_transit")
        assert exc_info.value.code == "INVALID_STATE_TRANSITION"
