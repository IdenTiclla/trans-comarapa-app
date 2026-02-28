"""
Trip service - contains trip business logic.

Extracted from routes/trip.py.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Any, Dict

from sqlalchemy.orm import Session
from sqlalchemy import func

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
from models.package import Package
from schemas.driver import Driver as DriverSchema
from schemas.assistant import Assistant as AssistantSchema
from repositories.trip_repository import TripRepository
from repositories.package_repository import PackageRepository
from schemas.trip import TripCreate, TripUpdate
from core.state_machines import validate_transition, TRIP_TRANSITIONS
from core.enums import TripStatus, PackageStatus

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
        upcoming: bool = False,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        min_seats: Optional[int] = None,
        sort_by: str = "trip_datetime",
        sort_direction: str = "asc",
    ) -> Dict[str, Any]:
        """Get trips with filtering and pagination. Returns dict with trips and pagination info."""
        trips, total = self.repo.get_with_filters(
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            route_id=route_id,
            driver_id=driver_id,
            bus_id=bus_id,
            upcoming=upcoming,
            origin=origin,
            destination=destination,
            date_from=date_from,
            date_to=date_to,
            min_seats=min_seats,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        processed_trips = []
        for trip in trips:
            origin_name = trip.route.origin_location.name if trip.route and trip.route.origin_location else "Unknown"
            destination_name = trip.route.destination_location.name if trip.route and trip.route.destination_location else "Unknown"
            route_price = trip.route.price if trip.route else 0
            
            total_seats = trip.bus.capacity if trip.bus else 0
            
            occupied_seats_count = self.db.query(func.count(Ticket.id)).filter(
                Ticket.trip_id == trip.id, Ticket.state != 'cancelled'
            ).scalar() or 0
            
            available_seats = total_seats - occupied_seats_count

            processed_trips.append({
                "id": trip.id,
                "trip_datetime": trip.trip_datetime,
                "status": trip.status,
                "driver_id": trip.driver_id,
                "assistant_id": trip.assistant_id,
                "bus_id": trip.bus_id,
                "route_id": trip.route_id,
                "route": {
                    "origin": origin_name,
                    "destination": destination_name,
                    "price": route_price
                },
                "total_seats": total_seats,
                "available_seats": available_seats,
                "occupied_seats": occupied_seats_count,
            })

        return {
            "trips": processed_trips,
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit,
                "pages": (total + limit - 1) // limit if limit > 0 else 0
            }
        }

    def get_trip_detail(self, trip_id: int) -> Dict[str, Any]:
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        
        origin_name = trip.route.origin_location.name if trip.route and trip.route.origin_location else "Unknown"
        destination_name = trip.route.destination_location.name if trip.route and trip.route.destination_location else "Unknown"
        route_price = trip.route.price if trip.route else 0

        total_seats_capacity = trip.bus.capacity if trip.bus else 0
        seats_layout = []
        occupied_seat_numbers = []
        
        occupied_seat_ids = set()
        
        if trip.bus:
            bus_seats = self.db.query(Seat).filter(Seat.bus_id == trip.bus_id).order_by(Seat.seat_number).all()
            trip_tickets = self.db.query(Ticket).filter(
                Ticket.trip_id == trip.id, Ticket.state.in_(["pending", "confirmed"])
            ).all()
            
            occupied_seat_ids = {t.seat_id for t in trip_tickets}
            
            for seat in bus_seats:
                status = "occupied" if seat.id in occupied_seat_ids else "available"
                seats_layout.append({
                    "id": seat.id,
                    "seat_number": seat.seat_number,
                    "status": status,
                    "deck": seat.deck,
                    "row": seat.row,
                    "column": seat.column,
                })
                if status == "occupied":
                    occupied_seat_numbers.append(seat.seat_number)
                    
        available_seats_count = total_seats_capacity - len(occupied_seat_ids)

        return {
            "id": trip.id,
            "trip_datetime": trip.trip_datetime,
            "departure_time": trip.trip_datetime.strftime('%H:%M') if trip.trip_datetime else None,
            "status": trip.status,
            "driver_id": trip.driver_id,
            "assistant_id": trip.assistant_id,
            "bus_id": trip.bus_id,
            "route_id": trip.route_id,
            "route": {
                "origin": origin_name,
                "destination": destination_name,
                "price": route_price
            },
            "price": route_price,
            "total_seats": total_seats_capacity,
            "available_seats": available_seats_count,
            "occupied_seat_numbers": sorted(list(set(occupied_seat_numbers))),
            "seats_layout": seats_layout,
            "driver": DriverSchema.model_validate(trip.driver).model_dump() if trip.driver else None,
            "assistant": AssistantSchema.model_validate(trip.assistant).model_dump() if trip.assistant else None,
            "bus": {
                "id": trip.bus.id,
                "license_plate": trip.bus.license_plate,
                "capacity": trip.bus.capacity,
                "model": trip.bus.model,
                "brand": trip.bus.brand,
                "color": trip.bus.color,
                "floors": trip.bus.floors
            } if trip.bus else None,
            "secretary": {
                "id": trip.secretary.id,
                "firstname": trip.secretary.firstname,
                "lastname": trip.secretary.lastname
            } if trip.secretary else None
        }

    def get_available_seats(self, trip_id: int) -> Dict[str, Any]:
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        if not trip.bus:
            raise NotFoundException(f"Bus not found for trip {trip_id}")
            
        bus_seats = self.db.query(Seat).filter(Seat.bus_id == trip.bus.id).all()
        if not bus_seats:
            return {
                "total_seats": trip.bus.capacity,
                "available_seats": trip.bus.capacity,
                "occupied_seats": [],
                "occupied_seats_info": [],
                "available_seat_numbers": list(range(1, trip.bus.capacity + 1))
            }
            
        occupied_tickets = self.db.query(Ticket).filter(
            Ticket.trip_id == trip_id, Ticket.state != 'cancelled'
        ).all()
        
        occupied_seat_ids = {t.seat_id for t in occupied_tickets}
        available_seats = [s for s in bus_seats if s.id not in occupied_seat_ids]
        
        occupied_seat_numbers = []
        occupied_seats_info = []
        
        for ticket in occupied_tickets:
            seat = next((s for s in bus_seats if s.id == ticket.seat_id), None)
            if seat:
                occupied_seat_numbers.append(seat.seat_number)
                occupied_seats_info.append({
                    "seat_number": seat.seat_number,
                    "ticket_id": ticket.id,
                    "client_id": ticket.client_id,
                    "state": ticket.state
                })
                
        return {
            "total_seats": len(bus_seats),
            "available_seats": len(available_seats),
            "occupied_seats": occupied_seat_numbers,
            "occupied_seats_info": occupied_seats_info,
            "available_seat_numbers": [s.seat_number for s in available_seats]
        }

    def create_trip(self, data: TripCreate) -> Trip:
        """Create a new trip with validation."""
        min_departure = datetime.now() + timedelta(minutes=30)
        # Fix tz-naive vs tz-aware comparison
        if data.trip_datetime.tzinfo is None:
            # Assume it's local time if naive, just compare without tz
            min_departure = min_departure.replace(tzinfo=None)
        
        if data.trip_datetime.replace(tzinfo=None) < min_departure:
            raise ValidationException(f"Trip datetime must be at least 30 minutes in the future. Current minimum: {min_departure}")

        if data.driver_id and not self.db.query(Driver).filter(Driver.id == data.driver_id).first():
            raise NotFoundException(f"Driver with id {data.driver_id} not found")
        if not self.db.query(Bus).filter(Bus.id == data.bus_id).first():
            raise NotFoundException(f"Bus with id {data.bus_id} not found")
        if not self.db.query(Route).filter(Route.id == data.route_id).first():
            raise NotFoundException(f"Route with id {data.route_id} not found")
        if not self.db.query(Secretary).filter(Secretary.id == data.secretary_id).first():
            raise NotFoundException(f"Secretary with id {data.secretary_id} not found")
        if data.assistant_id and not self.db.query(Assistant).filter(Assistant.id == data.assistant_id).first():
            raise NotFoundException(f"Assistant with id {data.assistant_id} not found")

        trip_dt = data.trip_datetime.replace(tzinfo=None)
        
        if data.driver_id:
            conflict = self.repo.find_driver_conflict(data.driver_id, trip_dt)
            if conflict:
                raise ConflictException(f"Driver {data.driver_id} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")
        
        conflict = self.repo.find_bus_conflict(data.bus_id, trip_dt)
        if conflict:
            raise ConflictException(f"Bus {data.bus_id} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")
            
        if data.assistant_id:
            conflict = self.repo.find_assistant_conflict(data.assistant_id, trip_dt)
            if conflict:
                raise ConflictException(f"Assistant {data.assistant_id} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")
                
        conflict = self.repo.find_duplicate(trip_dt, data.bus_id, data.route_id, data.driver_id, data.assistant_id)
        if conflict:
            raise ConflictException(f"Trip already exists with id {conflict.id}")

        trip_data = data.model_dump()
        new_trip = Trip(**trip_data)
        self.db.add(new_trip)
        try:
            self.db.commit()
            self.db.refresh(new_trip)
        except Exception as e:
            self.db.rollback()
            raise ValidationException("Foreign key constraint failed: check provided IDs")

        return new_trip

    def update_trip(self, trip_id: int, data: TripUpdate) -> Trip:
        """Update a trip."""
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        update_data = data.model_dump(exclude_unset=True)

        if "driver_id" in update_data and update_data["driver_id"]:
            if not self.db.query(Driver).filter(Driver.id == update_data["driver_id"]).first():
                raise NotFoundException(f"Driver with id {update_data['driver_id']} not found")
            trip_dt = update_data.get('trip_datetime', trip.trip_datetime).replace(tzinfo=None)
            conflict = self.repo.find_driver_conflict(update_data["driver_id"], trip_dt, exclude_trip_id=trip_id)
            if conflict:
                raise ConflictException(f"Driver {update_data['driver_id']} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")

        if "bus_id" in update_data and update_data["bus_id"]:
            if not self.db.query(Bus).filter(Bus.id == update_data["bus_id"]).first():
                raise NotFoundException(f"Bus with id {update_data['bus_id']} not found")
            trip_dt = update_data.get('trip_datetime', trip.trip_datetime).replace(tzinfo=None)
            conflict = self.repo.find_bus_conflict(update_data["bus_id"], trip_dt, exclude_trip_id=trip_id)
            if conflict:
                raise ConflictException(f"Bus {update_data['bus_id']} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")
                
        if "assistant_id" in update_data and update_data["assistant_id"]:
            if not self.db.query(Assistant).filter(Assistant.id == update_data["assistant_id"]).first():
                raise NotFoundException(f"Assistant with id {update_data['assistant_id']} not found")
            trip_dt = update_data.get('trip_datetime', trip.trip_datetime).replace(tzinfo=None)
            conflict = self.repo.find_assistant_conflict(update_data["assistant_id"], trip_dt, exclude_trip_id=trip_id)
            if conflict:
                raise ConflictException(f"Assistant {update_data['assistant_id']} is already assigned to trip id {conflict.id} at {conflict.trip_datetime}")

        if "route_id" in update_data and update_data["route_id"]:
            if not self.db.query(Route).filter(Route.id == update_data["route_id"]).first():
                raise NotFoundException(f"Route with id {update_data['route_id']} not found")

        if "status" in update_data:
            validate_transition("trip", TRIP_TRANSITIONS, trip.status, update_data["status"])

        for field, value in update_data.items():
            setattr(trip, field, value)

        try:
            self.db.commit()
            self.db.refresh(trip)
        except Exception:
            self.db.rollback()
            raise ValidationException("Foreign key constraint failed: check provided IDs")
            
        return trip

    def delete_trip(self, trip_id: int) -> None:
        """Delete a trip."""
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        ticket_count = self.db.query(Ticket).filter(Ticket.trip_id == trip_id).count()
        if ticket_count > 0:
            raise ValidationException(f"Cannot delete trip with id {trip_id} because it has {ticket_count} associated tickets. Delete the tickets first.")

        self.db.delete(trip)
        self.db.commit()

    def get_trip_driver(self, trip_id: int):
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        if not trip.driver:
            raise NotFoundException(f"No driver assigned to trip {trip_id}")
        return trip.driver

    def get_trip_assistant(self, trip_id: int):
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        if not trip.assistant:
            raise NotFoundException(f"No assistant assigned to trip {trip_id}")
        return trip.assistant

    def _bulk_transition_packages(self, trip_id: int, from_status: str, to_status: str) -> None:
        package_repo = PackageRepository(self.db)
        packages = self.db.query(Package).filter(
            Package.trip_id == trip_id,
            Package.status == from_status
        ).all()
        
        for pkg in packages:
            old_status = pkg.status
            pkg.status = to_status
            package_repo.log_state_change(
                package_id=pkg.id,
                old_state=old_status,
                new_state=to_status
            )

    def dispatch_trip(self, trip_id: int) -> Trip:
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        if trip.status not in [TripStatus.SCHEDULED, TripStatus.BOARDING]:
            # Adjust mapping appropriately if current state makes DEPARTED valid
            # according to the TRIP_TRANSITIONS, but actually we use validate_transition
            pass
            
        validate_transition("trip", TRIP_TRANSITIONS, trip.status, TripStatus.DEPARTED)
        
        trip.status = TripStatus.DEPARTED
        self._bulk_transition_packages(trip_id, PackageStatus.ASSIGNED_TO_TRIP, PackageStatus.IN_TRANSIT)
        self.db.commit()
        self.db.refresh(trip)
        return trip

    def finish_trip(self, trip_id: int) -> Trip:
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        validate_transition("trip", TRIP_TRANSITIONS, trip.status, TripStatus.ARRIVED)
        
        trip.status = TripStatus.ARRIVED
        # Removed automatic package status change. Packages must be received manually.
        self.db.commit()
        self.db.refresh(trip)
        return trip

    def cancel_trip(self, trip_id: int) -> Trip:
        trip = self.repo.get_by_id_or_raise(trip_id, "Trip")
        validate_transition("trip", TRIP_TRANSITIONS, trip.status, TripStatus.CANCELLED)
        
        trip.status = TripStatus.CANCELLED
        # Unassign packages and return them to office
        package_repo = PackageRepository(self.db)
        packages = self.db.query(Package).filter(
            Package.trip_id == trip_id
        ).all()
        
        for pkg in packages:
            old_status = pkg.status
            pkg.status = PackageStatus.REGISTERED_AT_OFFICE
            pkg.trip_id = None
            package_repo.log_state_change(
                package_id=pkg.id,
                old_state=old_status,
                new_state=PackageStatus.REGISTERED_AT_OFFICE
            )
            
        self.db.commit()
        self.db.refresh(trip)
        return trip
