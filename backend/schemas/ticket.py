from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Any, Literal
from schemas.client import Client as ClientSchema
from schemas.secretary import Secretary as SecretarySchema
from schemas.seat import Seat as SeatSchema
from schemas.location import Location as LocationSchema

class TicketBase(BaseModel):
    state: str = Field(..., description="State of the ticket", example="pending")
    seat_id: int = Field(..., description="ID of the seat", example=1, gt=0)
    client_id: int = Field(..., description="ID of the client", example=1, gt=0)
    trip_id: int = Field(..., description="ID of the trip", example=1, gt=0)
    destination: Optional[str] = Field(None, description="Name of the destination", example="Terminal Cochabamba")
    price: float = Field(..., description="Price of the ticket", example=30.0, gt=0)
    payment_method: str = Field(..., description="Payment method used", example="cash")

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
    operator_user_id: int = Field(..., description="User ID of the operator (secretary/admin) creating the ticket", example=1, gt=0)
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

class TicketUpdate(BaseModel):
    """
    Schema for updating a ticket
    """
    state: Optional[str] = None
    seat_id: Optional[int] = None
    client_id: Optional[int] = None
    trip_id: Optional[int] = None
    destination: Optional[str] = Field(None, description="Name of the destination", example="Terminal Cochabamba")
    price: Optional[float] = Field(default=None, description="Price of the ticket", example=30.0, gt=0)
    payment_method: Optional[str] = Field(default=None, description="Payment method used", example="cash")
    secretary_id: Optional[int] = Field(default=None, description="ID of the secretary associated with the ticket", example=1, gt=0)

    @field_validator('state', check_fields=False)
    @classmethod
    def validate_state(cls, v):
        if v is None:
            return v
        valid_states = ["pending", "confirmed", "cancelled", "completed"]
        if v.lower() not in valid_states:
            raise ValueError(f"Invalid ticket state: {v}. Valid states are: {', '.join(valid_states)}")
        return v.lower()
    
    class Config:
        from_attributes = True

class Ticket(TicketBase):
    """
    Schema for reading a ticket
    """
    id: int
    secretary_id: int = Field(..., description="Actual Foreign Key to secretaries table")
    created_at: datetime
    updated_at: datetime
    client: ClientSchema
    secretary: SecretarySchema
    seat: SeatSchema

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
