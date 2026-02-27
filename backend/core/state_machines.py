"""
Centralized state-machine definitions for domain entities.

Each entity has a dictionary mapping current_state → list of valid target_states.
The `validate_transition` function enforces these rules and raises
`InvalidStateTransitionException` on violations.
"""

from core.enums import PackageStatus, TicketState, TripStatus
from core.exceptions import InvalidStateTransitionException


# ── Ticket state transitions ────────────────────────────────────────────
TICKET_TRANSITIONS: dict[str, list[str]] = {
    TicketState.PENDING: [TicketState.CONFIRMED, TicketState.CANCELLED],
    TicketState.CONFIRMED: [TicketState.COMPLETED, TicketState.CANCELLED],
    TicketState.CANCELLED: [],  # terminal state
    TicketState.COMPLETED: [],  # terminal state
}

# ── Package status transitions ──────────────────────────────────────────
PACKAGE_TRANSITIONS: dict[str, list[str]] = {
    PackageStatus.REGISTERED_AT_OFFICE: [PackageStatus.ASSIGNED_TO_TRIP],
    PackageStatus.ASSIGNED_TO_TRIP: [PackageStatus.IN_TRANSIT, PackageStatus.REGISTERED_AT_OFFICE],
    PackageStatus.IN_TRANSIT: [PackageStatus.ARRIVED_AT_DESTINATION],
    PackageStatus.ARRIVED_AT_DESTINATION: [PackageStatus.DELIVERED],
    PackageStatus.DELIVERED: [],  # terminal state
}

# ── Trip status transitions ─────────────────────────────────────────────
TRIP_TRANSITIONS: dict[str, list[str]] = {
    TripStatus.SCHEDULED: [TripStatus.BOARDING, TripStatus.CANCELLED, TripStatus.DELAYED],
    TripStatus.BOARDING: [TripStatus.DEPARTED, TripStatus.CANCELLED, TripStatus.DELAYED],
    TripStatus.DEPARTED: [TripStatus.ARRIVED],
    TripStatus.ARRIVED: [],  # terminal state
    TripStatus.CANCELLED: [],  # terminal state
    TripStatus.DELAYED: [TripStatus.BOARDING, TripStatus.CANCELLED],
}


def validate_transition(
    entity: str,
    transitions: dict[str, list[str]],
    current_state: str,
    target_state: str,
) -> None:
    """Validate a state transition and raise if not allowed.

    Args:
        entity: Human-readable entity name (e.g., "ticket", "package").
        transitions: The transition map for this entity type.
        current_state: The current state value.
        target_state: The desired new state value.

    Raises:
        InvalidStateTransitionException: If the transition is not allowed.
    """
    allowed = transitions.get(current_state, [])
    if target_state not in allowed:
        raise InvalidStateTransitionException(
            entity=entity,
            current_state=current_state,
            target_state=target_state,
            allowed_states=allowed,
        )
