"""
Centralized enum definitions for entity states throughout the application.

Replaces hardcoded string lists in schemas and routes with type-safe enums.
These enums are compatible with Pydantic v2 and SQLAlchemy string columns.
"""

from enum import Enum


class TicketState(str, Enum):
    """Possible states for a bus ticket."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PackageStatus(str, Enum):
    """Possible statuses for a package/encomienda."""
    REGISTERED_AT_OFFICE = "registered_at_office"
    ASSIGNED_TO_TRIP = "assigned_to_trip"
    IN_TRANSIT = "in_transit"
    ARRIVED_AT_DESTINATION = "arrived_at_destination"
    DELIVERED = "delivered"


class PackagePaymentStatus(str, Enum):
    """Status of package payment."""
    PAID_ON_SEND = "paid_on_send"
    COLLECT_ON_DELIVERY = "collect_on_delivery"


class TripStatus(str, Enum):
    """Possible statuses for a bus trip."""
    SCHEDULED = "scheduled"
    BOARDING = "boarding"
    DEPARTED = "departed"
    ARRIVED = "arrived"
    CANCELLED = "cancelled"
    DELAYED = "delayed"


class PaymentMethod(str, Enum):
    """Accepted payment methods."""
    CASH = "cash"
    TRANSFER = "transfer"
    QR = "qr"
