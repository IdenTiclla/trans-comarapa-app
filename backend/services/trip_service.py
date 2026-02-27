"""
Trip service - contains trip business logic.

Extracted from routes/trip.py.
"""

import logging
from datetime import datetime
from typing import Optional, Any, Dict

from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc, asc

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
)
from models.trip import Trip
from models.driver import Driver
from models.assistant import Assistant
from models.bus import Bus
from models.route import Route
from models.seat import Seat
from models.ticket import Ticket
from models.secretary import Secretary
from repositories.trip_repository import TripRepository
from schemas.trip import TripCreate, TripUpdate

logger = logging.getLogger(__name__)


class TripService:
    """Business logic for trip operations."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = TripRepository(db)

    def get_trips(
        self,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        route_id: Optional[int] = None,
        driver_id: Optional[int] = None,
        bus_id: Optional[int] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort_by: str = "trip_datetime",
        sort_direction: str = "asc",
    ) -> Dict[str, Any]:
        """Get trips with filtering and pagination. Returns dict with trips and pagination info."""
        query = self.db.query(Trip)

        # Apply filters
        if status:
            query = query.filter(Trip.status == status)
        if route_id:
            query = query.filter(Trip.route_id == route_id)
        if driver_id:
            query = query.filter(Trip.driver_id == driver_id)
        if bus_id:
            query = query.filter(Trip.bus_id == bus_id)
        if date_from:
            try:
                from_date = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(Trip.trip_datetime >= from_date)
            except ValueError:
                pass
        if date_to:
            try:
                to_date = datetime.strptime(date_to, "%Y-%m-%d")
                to_date = to_date.replace(hour=23, minute=59, second=59)
                query = query.filter(Trip.trip_datetime <= to_date)
            except ValueError:
                pass
        if search:
            search_term = f"%{search}%"
            query = query.join(Route, Trip.route_id == Route.id, isouter=True).filter(
                or_(
                    Route.name.ilike(search_term),
                    Trip.status.ilike(search_term),
                )
            )

        total = query.count()

        # Sorting
        sort_column = getattr(Trip, sort_by, Trip.trip_datetime)
        order_func = desc if sort_direction.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column))

        trips = query.offset(skip).limit(limit).all()

        return {
            "trips": trips,
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total,
        }

    def get_by_id(self, trip_id: int) -> Trip:
        """Get a trip by ID."""
        return self.repo.get_by_id_or_raise(trip_id, "Trip")

    def create_trip(self, data: TripCreate) -> Trip:
        """Create a new trip with validation."""
        logger.debug("Creating trip with data: %s", data)

        # Validate driver exists
        driver = self.db.query(Driver).filter(Driver.id == data.driver_id).first()
        if not driver:
            raise NotFoundException(f"Driver with id {data.driver_id} not found")

        # Validate bus exists
        bus = self.db.query(Bus).filter(Bus.id == data.bus_id).first()
        if not bus:
            raise NotFoundException(f"Bus with id {data.bus_id} not found")

        # Validate route exists
        route = self.db.query(Route).filter(Route.id == data.route_id).first()
        if not route:
            raise NotFoundException(f"Route with id {data.route_id} not found")

        # Validate secretary exists
        secretary = self.db.query(Secretary).filter(Secretary.id == data.secretary_id).first()
        if not secretary:
            raise NotFoundException(f"Secretary with id {data.secretary_id} not found")

        # Validate assistant if provided
        if data.assistant_id:
            assistant = self.db.query(Assistant).filter(Assistant.id == data.assistant_id).first()
            if not assistant:
                raise NotFoundException(f"Assistant with id {data.assistant_id} not found")

        # Check for driver conflicts
        existing = self.repo.find_driver_conflict(data.driver_id, data.trip_datetime)
        if existing:
            raise ConflictException(
                f"Driver {data.driver_id} already has a trip at {data.trip_datetime}"
            )

        # Create the trip
        trip_data = data.model_dump()
        new_trip = Trip(**trip_data)
        self.db.add(new_trip)
        self.db.commit()
        self.db.refresh(new_trip)

        logger.info("Trip created: %d", new_trip.id)
        return new_trip

    def update_trip(self, trip_id: int, data: TripUpdate) -> Trip:
        """Update a trip."""
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        update_data = data.model_dump(exclude_unset=True)

        # Validate references if being changed
        if "driver_id" in update_data and update_data["driver_id"]:
            driver = self.db.query(Driver).filter(Driver.id == update_data["driver_id"]).first()
            if not driver:
                raise NotFoundException(f"Driver with id {update_data['driver_id']} not found")

        if "bus_id" in update_data and update_data["bus_id"]:
            bus = self.db.query(Bus).filter(Bus.id == update_data["bus_id"]).first()
            if not bus:
                raise NotFoundException(f"Bus with id {update_data['bus_id']} not found")

        if "route_id" in update_data and update_data["route_id"]:
            route = self.db.query(Route).filter(Route.id == update_data["route_id"]).first()
            if not route:
                raise NotFoundException(f"Route with id {update_data['route_id']} not found")

        for field, value in update_data.items():
            if value is not None:
                setattr(trip, field, value)

        self.db.commit()
        self.db.refresh(trip)
        return trip

    def delete_trip(self, trip_id: int) -> None:
        """Delete a trip."""
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")

        # Check for associated tickets
        ticket_count = self.db.query(Ticket).filter(Ticket.trip_id == trip_id).count()
        if ticket_count > 0:
            raise ValidationException(
                f"Cannot delete trip {trip_id}: it has {ticket_count} associated tickets"
            )

        self.db.delete(trip)
        self.db.commit()
