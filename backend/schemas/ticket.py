from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any

class TicketBase(BaseModel):
    state: str = Field(..., description="State of the ticket", example="pending")
    seat_id: int = Field(..., description="ID of the seat", example=1)
    client_id: int = Field(..., description="ID of the client", example=1)
    trip_id: int = Field(..., description="ID of the trip", example=1)

    class Config:
        from_attributes = True

class TicketCreate(TicketBase):
    """
    Schema for creating a new ticket
    """ 
    pass

class ClientTicketCreate(BaseModel):
    """
    Simplified schema for creating a ticket through the client endpoint.
    Does not include client_id as it's derived from the path parameter.
    """
    state: str = Field(..., description="State of the ticket", example="pending")
    seat_id: int = Field(..., description="ID of the seat", example=1)
    trip_id: int = Field(..., description="ID of the trip", example=1)

class TicketUpdate(TicketBase):
    """
    Schema for updating a ticket
    """
    state: Optional[str] = None
    seat_id: Optional[int] = None
    client_id: Optional[int] = None
    trip_id: Optional[int] = None

class Ticket(TicketBase):
    """
    Schema for reading a ticket
    """
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
