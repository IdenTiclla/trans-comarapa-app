from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Any, Literal
from schemas.client import Client as ClientSchema
from schemas.secretary import Secretary as SecretarySchema

class TicketBase(BaseModel):
    state: str = Field(..., description="State of the ticket", example="pending")
    seat_id: int = Field(..., description="ID of the seat", example=1, gt=0)
    client_id: int = Field(..., description="ID of the client", example=1, gt=0)
    trip_id: int = Field(..., description="ID of the trip", example=1, gt=0)
    secretary_id: int = Field(..., description="ID of the secretary", example=1, gt=0)

    @field_validator('state')
    @classmethod
    def validate_state(cls, v):
        valid_states = ["pending", "confirmed", "cancelled", "completed"]
        if v.lower() not in valid_states:
            raise ValueError(f"Invalid ticket state: {v}. Valid states are: {', '.join(valid_states)}")
        return v.lower()

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
    seat_id: int = Field(..., description="ID of the seat", example=1, gt=0)
    trip_id: int = Field(..., description="ID of the trip", example=1, gt=0)
    
    @field_validator('state')
    @classmethod
    def validate_state(cls, v):
        valid_states = ["pending", "confirmed", "cancelled", "completed"]
        if v.lower() not in valid_states:
            raise ValueError(f"Invalid ticket state: {v}. Valid states are: {', '.join(valid_states)}")
        return v.lower()

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
    client: ClientSchema
    secretary: SecretarySchema

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
