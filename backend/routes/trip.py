from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_, func, desc
from models.trip import Trip as TripModel
from models.driver import Driver as DriverModel
from models.assistant import Assistant as AssistantModel
from models.bus import Bus as BusModel
from models.route import Route as RouteModel
from models.ticket import Ticket as TicketModel
from models.seat import Seat as SeatModel
from models.location import Location as LocationModel
from schemas.trip import TripCreate, Trip as TripSchema
from schemas.driver import Driver as DriverSchema
from schemas.assistant import Assistant as AssistantSchema
from schemas.seat import Seat as SeatSchema
from db.session import get_db  # dependency to get a new session
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

router = APIRouter(
    tags=["trips"]
)

@router.get("/", response_model=Dict[str, Any])
async def get_trips(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    upcoming: bool = Query(False, description="Filter for upcoming trips only"),
    search: Optional[str] = Query(None, description="Search by trip ID, origin, or destination"),
    origin: Optional[str] = Query(None, description="Filter by origin location name"),
    destination: Optional[str] = Query(None, description="Filter by destination location name"),
    date_from: Optional[datetime] = Query(None, description="Filter by minimum departure date"),
    date_to: Optional[datetime] = Query(None, description="Filter by maximum departure date"),
    status: Optional[str] = Query(None, description="Filter by trip status (comma-separated list)"),
    min_seats: Optional[int] = Query(None, description="Filter by minimum available seats"),
    sort_by: Optional[str] = Query("trip_datetime", description="Field to sort by"),
    sort_direction: Optional[str] = Query("asc", description="Sort direction (asc or desc)"),
    db: Session = Depends(get_db)
):
    """
    Get trips with filtering and pagination

    Returns a dictionary with trips and pagination information
    """
    # Start with a base query
    query = db.query(TripModel)

    # Apply filters
    if upcoming:
        query = query.filter(TripModel.trip_datetime >= datetime.now())

    # Search filter - searches across trip ID, origin, and destination  
    if search:
        search_conditions = []
        
        # Search by trip ID (convert search term to integer if possible)
        try:
            trip_id = int(search)
            search_conditions.append(TripModel.id == trip_id)
        except ValueError:
            pass
        
        # Create subqueries for origin and destination searches
        origin_subquery = db.query(TripModel.id).join(RouteModel)\
                           .join(LocationModel, RouteModel.origin_location_id == LocationModel.id)\
                           .filter(LocationModel.name.ilike(f"%{search}%"))
        
        destination_subquery = db.query(TripModel.id).join(RouteModel)\
                              .join(LocationModel, RouteModel.destination_location_id == LocationModel.id)\
                              .filter(LocationModel.name.ilike(f"%{search}%"))
        
        # Add location-based searches to conditions
        search_conditions.extend([
            TripModel.id.in_(origin_subquery),
            TripModel.id.in_(destination_subquery)
        ])
        
        # Apply OR condition for all search terms
        query = query.filter(or_(*search_conditions))

    if origin:
        # Use subquery approach for origin filter to avoid join conflicts
        origin_subquery = db.query(TripModel.id).join(RouteModel)\
                           .join(LocationModel, RouteModel.origin_location_id == LocationModel.id)\
                           .filter(LocationModel.name.ilike(f"%{origin}%"))
        query = query.filter(TripModel.id.in_(origin_subquery))

    if destination:
        # Use subquery approach for destination filter to avoid join conflicts
        destination_subquery = db.query(TripModel.id).join(RouteModel)\
                              .join(LocationModel, RouteModel.destination_location_id == LocationModel.id)\
                              .filter(LocationModel.name.ilike(f"%{destination}%"))
        query = query.filter(TripModel.id.in_(destination_subquery))

    if date_from:
        query = query.filter(TripModel.trip_datetime >= date_from)

    if date_to:
        query = query.filter(TripModel.trip_datetime <= date_to)

    if status:
        # Split comma-separated status values
        status_values = [s.strip() for s in status.split(',')]
        query = query.filter(TripModel.status.in_(status_values))

    # Filter by minimum available seats (this requires a subquery to count occupied seats)
    if min_seats:
        # Subquery to get occupied seats count for each trip
        occupied_seats_subquery = db.query(
            TicketModel.trip_id,
            func.count(TicketModel.id).label('occupied_count')
        ).filter(TicketModel.state != 'cancelled')\
         .group_by(TicketModel.trip_id).subquery()
        
        # Join with bus to get capacity and with occupied seats subquery
        query = query.join(BusModel, TripModel.bus_id == BusModel.id)\
                    .outerjoin(occupied_seats_subquery, TripModel.id == occupied_seats_subquery.c.trip_id)\
                    .filter(
                        BusModel.capacity - func.coalesce(occupied_seats_subquery.c.occupied_count, 0) >= min_seats
                    )

    # Get total count for pagination (before applying sorting and pagination)
    total_count = query.count()

    # Apply sorting
    if sort_by and sort_direction:
        if sort_by == "trip_datetime":
            order_column = TripModel.trip_datetime
        elif sort_by == "status":
            order_column = TripModel.status
        elif sort_by == "id":
            order_column = TripModel.id
        else:
            order_column = TripModel.trip_datetime  # Default fallback
        
        if sort_direction.lower() == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(order_column)
    else:
        # Default ordering
        query = query.order_by(TripModel.trip_datetime)

    # Apply pagination
    query = query.offset(skip).limit(limit)

    # Execute query
    trips = query.all()

    # Process trips to include additional information
    processed_trips = []
    for trip in trips:
        origin_name = "Unknown"
        destination_name = "Unknown"
        route_price = 0
        
        if trip.route:
            if trip.route.origin_location:
                origin_name = trip.route.origin_location.name
            if trip.route.destination_location:
                destination_name = trip.route.destination_location.name
            route_price = trip.route.price

        total_seats = 0
        occupied_seats_count = 0
        if trip.bus:
            total_seats = trip.bus.capacity
            # Ensure trip_id is valid for the subquery
            if trip.id:
                occupied_seats_count = db.query(func.count(TicketModel.id)).filter(
                    TicketModel.trip_id == trip.id,
                    TicketModel.state != 'cancelled'
                ).scalar() or 0 # Ensure scalar() returns 0 if None
            else: # Should not happen if trip is from DB, but defensive
                occupied_seats_count = 0
        
        available_seats = total_seats - occupied_seats_count

        processed_trip = {
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
            # Optionally include full driver/assistant/bus objects if needed by frontend
            # "driver": DriverSchema.from_orm(trip.driver).model_dump() if trip.driver else None,
            # "assistant": AssistantSchema.from_orm(trip.assistant).model_dump() if trip.assistant else None,
            # "bus": trip.bus.to_dict() if trip.bus else None, # Assuming BusModel has to_dict() or use a schema
        }
        processed_trips.append(processed_trip)

    # Return trips with pagination information
    return {
        "trips": processed_trips,
        "pagination": {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit  # Ceiling division
        }
    }

@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    """Create a new trip with comprehensive validation"""

    # 1. Validate trip date is in the future
    min_departure = datetime.now() + timedelta(minutes=30)
    if trip.trip_datetime < min_departure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trip datetime must be at least 30 minutes in the future. Current minimum: {min_departure}"
        )

    # 2. Verify that the driver exists
    driver = db.query(DriverModel).filter(DriverModel.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with id {trip.driver_id} not found"
        )

    # 3. Verify that the bus exists
    bus = db.query(BusModel).filter(BusModel.id == trip.bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus with id {trip.bus_id} not found"
        )

    # 4. Verify that the route exists
    route = db.query(RouteModel).filter(RouteModel.id == trip.route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route with id {trip.route_id} not found"
        )

    # 5. Check assistant if specified
    if trip.assistant_id:
        assistant = db.query(AssistantModel).filter(AssistantModel.id == trip.assistant_id).first()
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assistant with id {trip.assistant_id} not found"
            )

    # 6. Define time buffer for conflict detection (2 hours before and after)
    buffer_hours = 2
    trip_start = trip.trip_datetime - timedelta(hours=buffer_hours)
    trip_end = trip.trip_datetime + timedelta(hours=buffer_hours)

    # 7. Check for driver conflicts - driver shouldn't have another trip within the time buffer
    driver_conflict = db.query(TripModel).filter(
        TripModel.driver_id == trip.driver_id,
        TripModel.trip_datetime.between(trip_start, trip_end)
    ).first()

    if driver_conflict:
        conflict_time = driver_conflict.trip_datetime
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Driver with id {trip.driver_id} is already assigned to trip id {driver_conflict.id} at {conflict_time}"
        )

    # 8. Check for bus conflicts - bus shouldn't have another trip within the time buffer
    bus_conflict = db.query(TripModel).filter(
        TripModel.bus_id == trip.bus_id,
        TripModel.trip_datetime.between(trip_start, trip_end)
    ).first()

    if bus_conflict:
        conflict_time = bus_conflict.trip_datetime
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Bus with id {trip.bus_id} is already assigned to trip id {bus_conflict.id} at {conflict_time}"
        )

    # 9. Check for assistant conflicts if assistant is specified
    if trip.assistant_id:
        assistant_conflict = db.query(TripModel).filter(
            TripModel.assistant_id == trip.assistant_id,
            TripModel.trip_datetime.between(trip_start, trip_end)
        ).first()

        if assistant_conflict:
            conflict_time = assistant_conflict.trip_datetime
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Assistant with id {trip.assistant_id} is already assigned to trip id {assistant_conflict.id} at {conflict_time}"
            )

    # 10. Check for duplicate trips based on all properties
    duplicate_trip = db.query(TripModel).filter(
        TripModel.trip_datetime == trip.trip_datetime,
        TripModel.driver_id == trip.driver_id,
        TripModel.bus_id == trip.bus_id,
        TripModel.route_id == trip.route_id
    )

    # Conditionally add assistant check if an assistant is assigned
    if trip.assistant_id:
        duplicate_trip = duplicate_trip.filter(TripModel.assistant_id == trip.assistant_id)
    else:
        duplicate_trip = duplicate_trip.filter(TripModel.assistant_id == None)

    # Get the first result (if any)
    duplicate_trip = duplicate_trip.first()

    if duplicate_trip:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Trip already exists with id {duplicate_trip.id}"
        )

    # All validations passed - create the trip
    db_trip = TripModel(**trip.model_dump())
    try:
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Foreign key constraint failed: check driver and assistant IDs"
        ) from exc

    return db_trip

@router.get("/{trip_id}", response_model=Dict[str, Any])
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get a trip by ID with all related information, including detailed seat layout.
    """
    try:
        trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {trip_id} not found"
            )

        # Process trip data similar to the list endpoint
        origin_name = "Unknown"
        destination_name = "Unknown"
        route_price = 0
        
        if trip.route:
            if trip.route.origin_location:
                origin_name = trip.route.origin_location.name
            if trip.route.destination_location:
                destination_name = trip.route.destination_location.name
            route_price = trip.route.price

        total_seats_capacity = 0
        seats_layout = []
        occupied_seat_numbers_for_trip = [] # Keep this for compatibility if needed elsewhere or for quick check

        if trip.bus:
            total_seats_capacity = trip.bus.capacity
            
            # Get all seats for this bus
            bus_all_seats = db.query(SeatModel).filter(SeatModel.bus_id == trip.bus_id).order_by(SeatModel.seat_number).all()
            
            # Get tickets for this specific trip to determine occupied seats
            trip_tickets = db.query(TicketModel).filter(
                TicketModel.trip_id == trip.id,
                TicketModel.state.in_(["pending", "confirmed"]) # Consider pending and confirmed as occupied
            ).all()
            
            occupied_seat_ids_for_trip = {ticket.seat_id for ticket in trip_tickets}

            for seat_model in bus_all_seats:
                status = "occupied" if seat_model.id in occupied_seat_ids_for_trip else "available"
                seats_layout.append({
                    "id": seat_model.id, # This is the PK
                    "seat_number": seat_model.seat_number,
                    "status": status,
                    "deck": seat_model.deck,
                    # "position": seat_model.position, # Assuming SeatModel has position (window/aisle)
                    # "type": seat_model.type # Assuming SeatModel has type (normal, vip)
                })
                if status == "occupied":
                    occupied_seat_numbers_for_trip.append(seat_model.seat_number)
        
        available_seats_count = total_seats_capacity - len(occupied_seat_ids_for_trip)


        trip_time = None
        if trip.trip_datetime:
            trip_time = trip.trip_datetime.strftime('%H:%M')

        processed_trip = {
            "id": trip.id,
            "trip_datetime": trip.trip_datetime,
            "departure_time": trip_time,
            "status": trip.status,
            "driver_id": trip.driver_id,
            "assistant_id": trip.assistant_id,
            "bus_id": trip.bus_id,
            "route_id": trip.route_id,
            "route": {
                "origin": origin_name,
                "destination": destination_name,
                "price": route_price # Frontend uses trip.price or trip.route.price
            },
            "price": route_price, # Explicitly add price at top level for easier access by frontend if needed
            "total_seats": total_seats_capacity, # Total capacity of the bus
            "available_seats": available_seats_count,
            "occupied_seat_numbers": sorted(list(set(occupied_seat_numbers_for_trip))), # List of occupied seat numbers
            "seats_layout": seats_layout, # Detailed layout of all seats with their status for THIS trip
            "driver": DriverSchema.from_orm(trip.driver).model_dump() if trip.driver else None,
            "assistant": AssistantSchema.from_orm(trip.assistant).model_dump() if trip.assistant else None,
            "bus": {
                "id": trip.bus.id,
                "license_plate": trip.bus.license_plate,
                "capacity": trip.bus.capacity,
                "model": trip.bus.model,
                "brand": trip.bus.brand,
                "color": trip.bus.color
            } if trip.bus else None,
            "secretary": {
                "id": trip.secretary.id,
                "firstname": trip.secretary.firstname,
                "lastname": trip.secretary.lastname
            } if trip.secretary else None
        }

        return processed_trip
    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_trip for id {trip_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing trip data: {str(e)}"
        )

@router.get("/{trip_id}/driver", response_model=DriverSchema)
def get_trip_driver(trip_id: int, db: Session = Depends(get_db)):
    """
    Get the driver assigned to a specific trip

    Args:
        trip_id: The ID of the trip
        db: Database session dependency

    Returns:
        DriverSchema: The driver details

    Raises:
        HTTPException: If trip or driver not found
    """
    db_trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not db_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    # Use the relationship directly since it's already loaded
    driver = db_trip.driver
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No driver assigned to trip {trip_id}"
        )

    return driver


@router.get("/{trip_id}/assistant", response_model=AssistantSchema)
def get_trip_assistant(trip_id: int, db: Session = Depends(get_db)):
    """Get the assistant assigned to a specific trip"""


    db_trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not db_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    # Use the relationship directly since it's already loaded
    assistant = db_trip.assistant
    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No assistant assigned to trip {trip_id}"
        )

    return assistant

@router.get("/{trip_id}/available-seats")
async def get_available_seats(trip_id: int, db: Session = Depends(get_db)):
    """
    Get available seats for a specific trip

    Returns a list of available seat numbers and a count of total and available seats
    """
    # First, check if trip exists
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    # Get the bus for this trip to know total seats
    bus = trip.bus
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bus not found for trip with id {trip_id}"
        )

    # Get all seats for this bus
    bus_seats = db.query(SeatModel).filter(SeatModel.bus_id == bus.id).all()

    # If no seats are defined for this bus, return empty result
    if not bus_seats:
        return {
            "total_seats": bus.capacity,
            "available_seats": bus.capacity,  # Assuming all seats are available if none are defined
            "occupied_seats": [],
            "available_seat_numbers": list(range(1, bus.capacity + 1))  # Generate seat numbers 1 to capacity
        }

    # Get occupied seats (seats that have tickets for this trip)
    occupied_seats = db.query(TicketModel).filter(
        TicketModel.trip_id == trip_id,
        TicketModel.state != 'cancelled'  # Exclude cancelled tickets
    ).all()

    # Extract seat IDs that are occupied
    occupied_seat_ids = [ticket.seat_id for ticket in occupied_seats]

    # Filter available seats
    available_seats = [seat for seat in bus_seats if seat.id not in occupied_seat_ids]

    # Extract seat numbers
    available_seat_numbers = [seat.seat_number for seat in available_seats]
    occupied_seat_numbers = []

    # Get occupied seat numbers
    for seat_id in occupied_seat_ids:
        seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
        if seat:
            occupied_seat_numbers.append(seat.seat_number)

    # Get additional information about occupied seats
    occupied_seats_info = []
    for ticket in occupied_seats:
        seat = db.query(SeatModel).filter(SeatModel.id == ticket.seat_id).first()
        if seat:
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
        "available_seat_numbers": available_seat_numbers
    }

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Delete a trip by ID
    """
    # First, check if trip exists
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    # Check if there are any tickets associated with this trip
    tickets = db.query(TicketModel).filter(TicketModel.trip_id == trip_id).all()

    if tickets:
        # If tickets exist, we cannot delete the trip
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete trip with id {trip_id} because it has {len(tickets)} associated tickets. Delete the tickets first."
        )

    # If no tickets, proceed with deletion
    db.delete(trip)
    db.commit()

    return {"message": "Trip deleted successfully", "status_code": status.HTTP_204_NO_CONTENT}
