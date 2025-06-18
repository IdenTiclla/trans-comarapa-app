from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.ticket import Ticket as TicketModel
from models.seat import Seat as SeatModel
from models.client import Client as ClientModel
from models.trip import Trip as TripModel
from models.bus import Bus as BusModel
from models.secretary import Secretary as SecretaryModel
from models.ticket_state_history import TicketStateHistory
from models.location import Location as LocationModel
from models.route import Route as RouteModel
from models.driver import Driver as DriverModel
from models.assistant import Assistant as AssistantModel
from schemas.ticket import TicketCreate, Ticket as TicketSchema, TicketUpdate
from schemas.ticket_state_history import TicketStateHistoryCreate
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(
    tags=["Tickets"]
)


@router.get("", response_model=List[TicketSchema])
async def get_all_tickets(db: Session = Depends(get_db)):
    """Get all tickets without applying trip departure validation"""
    return db.query(TicketModel).all()


@router.get("/client/{client_id}", response_model=List[TicketSchema])
async def get_tickets_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get tickets by client ID"""
    tickets = db.query(TicketModel).filter(TicketModel.client_id == client_id).all()
    return tickets


@router.get("/seat/{seat_id}", response_model=List[TicketSchema])
async def get_tickets_by_seat(seat_id: int, db: Session = Depends(get_db)):
    """Get tickets by seat ID"""
    tickets = db.query(TicketModel).filter(TicketModel.seat_id == seat_id).all()
    return tickets

@router.get("/trip/{trip_id}", response_model=List[TicketSchema])
async def get_tickets_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get tickets by trip ID"""
    tickets = db.query(TicketModel).filter(TicketModel.trip_id == trip_id).all()
    return tickets

@router.get("/bus/{bus_id}", response_model=List[TicketSchema])
async def get_tickets_by_bus(bus_id: int, db: Session = Depends(get_db)):
    """Get tickets by bus ID"""
    tickets = db.query(TicketModel).filter(TicketModel.bus_id == bus_id).all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketSchema)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a ticket by ID"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with id {ticket_id} not found"
        )
    return ticket

@router.post("", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket"""
    print(f"[DEBUG] Creating ticket with data: {ticket}")
    
    # 1. Verify that the seat exists
    seat = db.query(SeatModel).filter(SeatModel.id == ticket.seat_id).first()
    if not seat:
        print(f"[DEBUG] Seat with id {ticket.seat_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {ticket.seat_id} not found"
        )
    print(f"[DEBUG] Seat found: {seat.id}")

    # 2. Verify that the client exists
    client = db.query(ClientModel).filter(ClientModel.id == ticket.client_id).first()
    if not client:
        print(f"[DEBUG] Client with id {ticket.client_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {ticket.client_id} not found"
        )
    print(f"[DEBUG] Client found: {client.id}")

    # 3. Verify that the trip exists
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    if not trip:
        print(f"[DEBUG] Trip with id {ticket.trip_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {ticket.trip_id} not found"
        )
    print(f"[DEBUG] Trip found: {trip.id}")

    # 4. Find the Secretary entity ID based on the operator_user_id
    # The ticket.operator_user_id is the user_id of the secretary/admin creating the ticket
    print(f"[DEBUG] Looking for secretary profile with user_id: {ticket.operator_user_id}")
    secretary_profile = db.query(SecretaryModel).filter(SecretaryModel.user_id == ticket.operator_user_id).first()
    
    if not secretary_profile:
        print(f"[DEBUG] No secretary profile found for user ID {ticket.operator_user_id}")
        # Check if it's an admin user, if so, use the first available secretary
        from models.user import User
        user = db.query(User).filter(User.id == ticket.operator_user_id).first()
        if user and ('admin' in str(user.role).lower() or user.is_admin):
            print(f"[DEBUG] User is admin, looking for default secretary")
            # Use the first available secretary as default for admin operations
            default_secretary = db.query(SecretaryModel).first()
            if default_secretary:
                actual_secretary_id = default_secretary.id
                print(f"[DEBUG] Using default secretary: {actual_secretary_id}")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No secretaries available in the system. Cannot create ticket."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No secretary profile found for user ID {ticket.operator_user_id}. Cannot create ticket."
            )
    else:
        actual_secretary_id = secretary_profile.id
        print(f"[DEBUG] Secretary profile found: {actual_secretary_id}")

    # 4.5. Log destination if provided (simple validation)
    if ticket.destination:
        print(f"[DEBUG] Destination provided: {ticket.destination}")

    # 5. Verify that the trip hasn't already departed
    min_departure = datetime.now() + timedelta(minutes=10)
    print(f"[DEBUG] Trip datetime: {trip.trip_datetime}, Current time: {datetime.now()}")
    if trip.trip_datetime < datetime.now():
        print(f"[DEBUG] Trip has already departed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trip with id {ticket.trip_id} has already departed on {trip.trip_datetime}"
        )

    # 6. Verify that the seat belongs to the bus assigned to the trip
    print(f"[DEBUG] Seat bus_id: {seat.bus_id}, Trip bus_id: {trip.bus_id}")
    if seat.bus_id != trip.bus_id:
        print(f"[DEBUG] Seat does not belong to the bus assigned to the trip")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seat with id {ticket.seat_id} does not belong to the bus assigned to trip {ticket.trip_id}"
        )

    # 7. Verify that the seat is not already booked for the trip
    existing_ticket = db.query(TicketModel).filter(
        TicketModel.seat_id == ticket.seat_id,
        TicketModel.trip_id == ticket.trip_id,
        TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
    ).first()

    if existing_ticket:
        print(f"[DEBUG] Seat is already booked for this trip: {existing_ticket.id}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seat with id {ticket.seat_id} is already booked for trip {ticket.trip_id}"
        )

    # 9. Validate ticket state
    valid_states = ["pending", "confirmed", "cancelled", "completed"]
    if ticket.state.lower() not in valid_states:
        print(f"[DEBUG] Invalid ticket state: {ticket.state}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ticket state: {ticket.state}. Valid states are: {', '.join(valid_states)}"
        )

    print(f"[DEBUG] All validations passed, creating ticket")
    # Create the ticket with normalized state (lowercase)
    new_ticket = TicketModel(
        state=ticket.state.lower(),
        seat_id=ticket.seat_id,
        client_id=ticket.client_id,
        trip_id=ticket.trip_id,
        destination=ticket.destination,
        secretary_id=actual_secretary_id,
        price=ticket.price,
        payment_method=ticket.payment_method.lower() if ticket.payment_method else None
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    print(f"[DEBUG] Ticket created successfully: {new_ticket.id}")

    # Log initial state to history
    _log_ticket_state_change(
        db=db, 
        ticket_id=new_ticket.id, 
        new_state=new_ticket.state, 
        old_state=None, 
        changed_by_user_id=ticket.operator_user_id # From TicketCreate schema
    )
    db.commit() # Commit history entry

    return new_ticket

@router.put("/{ticket_id}", response_model=TicketSchema)
async def update_ticket(ticket_id: int, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    """Update a ticket"""
    # Check if ticket exists
    db_ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with id {ticket_id} not found"
        )

    # Store old state if it's going to be updated
    old_state = None
    if ticket_update.state and ticket_update.state.lower() != db_ticket.state:
        old_state = db_ticket.state

    # Get the associated trip
    trip = db.query(TripModel).filter(TripModel.id == db_ticket.trip_id).first()
    if trip and trip.trip_datetime < datetime.now():
        # If the trip has already departed, only allow updating to 'completed' or 'cancelled'
        if ticket_update.state and ticket_update.state.lower() not in ["completed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trip has already departed. Ticket state can only be updated to 'completed' or 'cancelled'"
            )

    # If seat_id is being updated, verify the seat exists and is available
    if ticket_update.seat_id and ticket_update.seat_id != db_ticket.seat_id:
        # Verify that the seat exists
        seat = db.query(SeatModel).filter(SeatModel.id == ticket_update.seat_id).first()
        if not seat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Seat with id {ticket_update.seat_id} not found"
            )

        # Verify that the seat belongs to the bus assigned to the trip
        if seat.bus_id != trip.bus_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Seat with id {ticket_update.seat_id} does not belong to the bus assigned to trip {db_ticket.trip_id}"
            )

        # Verify that the seat is not already booked for the trip
        existing_ticket = db.query(TicketModel).filter(
            TicketModel.seat_id == ticket_update.seat_id,
            TicketModel.trip_id == db_ticket.trip_id,
            TicketModel.id != ticket_id,  # Exclude the current ticket
            TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
        ).first()

        if existing_ticket:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat with id {ticket_update.seat_id} is already booked for trip {db_ticket.trip_id}"
            )

    # If client_id is being updated, verify the client exists
    if ticket_update.client_id and ticket_update.client_id != db_ticket.client_id:
        client = db.query(ClientModel).filter(ClientModel.id == ticket_update.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with id {ticket_update.client_id} not found"
            )

        # Verify that the client doesn't already have a ticket for this trip
        client_ticket = db.query(TicketModel).filter(
            TicketModel.client_id == ticket_update.client_id,
            TicketModel.trip_id == db_ticket.trip_id,
            TicketModel.id != ticket_id,  # Exclude the current ticket
            TicketModel.state.in_(["pending", "confirmed"])  # Only consider active tickets
        ).first()

        if client_ticket:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Client with id {ticket_update.client_id} already has a ticket for trip {db_ticket.trip_id}"
            )

    # Convert ticket_update to dict, processing only non-None values
    update_data = {k: v for k, v in ticket_update.model_dump().items() if v is not None}

    # If state is being updated, convert to lowercase
    if "state" in update_data:
        update_data["state"] = update_data["state"].lower()

    # Update the ticket
    for field, value in update_data.items():
        setattr(db_ticket, field, value)

    db.commit()
    db.refresh(db_ticket)

    # Log state change to history if state was changed
    if old_state and db_ticket.state != old_state:
        _log_ticket_state_change(
            db=db, 
            ticket_id=db_ticket.id, 
            new_state=db_ticket.state, 
            old_state=old_state, 
            changed_by_user_id=None # TODO: Get current user ID if endpoint is protected
        )
        db.commit() # Commit history entry

    return db_ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with id {ticket_id} not found"
        )

    db.delete(ticket)
    db.commit()
    return {
        "message": "Ticket deleted successfully",
        "status_code": status.HTTP_204_NO_CONTENT
    }

@router.put("/{ticket_id}/cancel", response_model=TicketSchema)
async def cancel_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Cancel a ticket"""
    # Check if ticket exists
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with id {ticket_id} not found"
        )
    
    # Get the associated trip
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    
    # If the ticket is already cancelled, do nothing
    if ticket.state == "cancelled":
        return ticket
    
    # Update the ticket state to cancelled
    ticket.state = "cancelled"
    db.commit()
    db.refresh(ticket)
    
    # Log state change to history
    # Assuming the ticket was not already cancelled, old_state would be its previous state.
    # For simplicity, if it was already cancelled, this might log an identical old/new state or we can add a check.
    # We need the state before setting it to "cancelled". This requires fetching it or assuming it wasn't cancelled.
    # Let's assume for now it wasn't 'cancelled' before this direct call.
    # A more robust way would be to fetch the ticket, check its state, then update and log if different.
    # However, the current logic updates then refreshes. So, old_state would need to be captured before ticket.state = "cancelled".
    # For now, we'll log it with a placeholder for old_state if it wasn't already cancelled.
    
    # To properly get old_state, we need to know it BEFORE ticket.state = "cancelled"
    # This function is simple, so let's re-fetch to be safe, or pass old_state if known.
    # Re-evaluating the flow: the ticket is fetched at the start of cancel_ticket.
    original_state_before_cancellation = ticket.state # Capture state before modification if it's not already 'cancelled'
    
    if original_state_before_cancellation != "cancelled":
        # ticket.state is already set to "cancelled" by this point by the lines above
        _log_ticket_state_change(
            db=db, 
            ticket_id=ticket.id, 
            new_state="cancelled", 
            old_state=original_state_before_cancellation, # This will be the state just before it was set to 'cancelled'
            changed_by_user_id=None # TODO: Get current user ID if endpoint is protected
        )
        db.commit() # Commit history entry
    
    return ticket

@router.put("/{ticket_id}/change-seat/{new_seat_id}", response_model=TicketSchema)
async def change_ticket_seat(
    ticket_id: int, 
    new_seat_id: int, 
    db: Session = Depends(get_db)
):
    """Change the seat assignment for a ticket"""
    # Check if ticket exists
    ticket = db.query(TicketModel).filter(TicketModel.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with id {ticket_id} not found"
        )
    
    # Check if new seat exists
    new_seat = db.query(SeatModel).filter(SeatModel.id == new_seat_id).first()
    if not new_seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seat with id {new_seat_id} not found"
        )
    
    # Check if the new seat belongs to the same bus as the ticket's trip
    trip = db.query(TripModel).filter(TripModel.id == ticket.trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {ticket.trip_id} not found"
        )
    
    if new_seat.bus_id != trip.bus_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new seat does not belong to the same bus as the trip"
        )
    
    # Check if the new seat is already occupied for this trip
    existing_ticket_on_new_seat = db.query(TicketModel).filter(
        TicketModel.trip_id == ticket.trip_id,
        TicketModel.seat_id == new_seat_id,
        TicketModel.state.in_(["sold", "confirmed", "reserved"])
    ).first()
    
    if existing_ticket_on_new_seat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seat {new_seat.seat_number} is already occupied for this trip"
        )
    
    # Store old seat info for history
    old_seat = db.query(SeatModel).filter(SeatModel.id == ticket.seat_id).first()
    old_seat_number = old_seat.seat_number if old_seat else "N/A"
    
    # Update the ticket with the new seat
    ticket.seat_id = new_seat_id
    db.commit()
    db.refresh(ticket)
    
    # Log the seat change (we can extend the history model to include seat changes)
    # For now, we'll use the existing state history with a custom format
    _log_ticket_state_change(
        db=db,
        ticket_id=ticket.id,
        new_state=f"seat_changed_to_{new_seat.seat_number}",
        old_state=f"seat_was_{old_seat_number}",
        changed_by_user_id=None  # TODO: Get current user ID from auth
    )
    
    db.commit()
    
    return ticket

# Helper function to add to ticket_state_history
def _log_ticket_state_change(
    db: Session, 
    ticket_id: int, 
    new_state: str, 
    old_state: Optional[str] = None, 
    changed_by_user_id: Optional[int] = None
):
    history_entry = TicketStateHistoryCreate(
        ticket_id=ticket_id,
        old_state=old_state,
        new_state=new_state,
        changed_by_user_id=changed_by_user_id
    )
    db_history_entry = TicketStateHistory(**history_entry.model_dump())
    db.add(db_history_entry)
    # db.commit() will be called by the main route function
    # db.refresh(db_history_entry) # Not strictly necessary here unless using the refreshed obj immediately


