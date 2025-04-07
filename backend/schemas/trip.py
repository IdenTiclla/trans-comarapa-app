"""
This module defines Pydantic schemas for Trip.
Includes examples and field descriptions.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timedelta
from schemas.driver import Driver as DriverSchema
from schemas.assistant import Assistant as AssistantSchema
from schemas.bus import Bus as BusSchema
from schemas.route import Route as RouteSchema
from schemas.secretary import Secretary as SecretarySchema

# Base model with common attributes
class TripBase(BaseModel):
    trip_datetime: datetime = Field(..., description="Trip date and time (YYYY-MM-DD HH:MM:SS)", example="2023-10-01 14:30:00")
    driver_id: int = Field(..., description="Driver identifier", example=1, gt=0)
    assistant_id: Optional[int] = Field(None, description="Assistant identifier", example=2)
    bus_id: int = Field(..., description="Bus identifier", example=3, gt=0)
    route_id: int = Field(..., description="Route identifier", example=4, gt=0)
    secretary_id: int = Field(..., description="Secretary identifier", example=5, gt=0)
    
    @field_validator('assistant_id')
    @classmethod 
    def validate_assistant_id(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Assistant ID must be a positive integer")
        return v

# Schema for creating a new trip
class TripCreate(TripBase):
    """
    Schema for creating a Trip.
    """
    @field_validator('trip_datetime')
    @classmethod
    def validate_future_date(cls, v):
        # Ensure trip date is in the future (at least 30 minutes from now)
        min_departure = datetime.now() + timedelta(minutes=30)
        if v < min_departure:
            raise ValueError(f"Trip datetime must be at least 30 minutes in the future. Current minimum: {min_departure}")
        return v

# Schema for reading trip details; includes id and ORM mode
class Trip(TripBase):
    id: int = Field(..., description="Trip identifier", example=1)
    driver: Optional[DriverSchema] = Field(None, description="Driver details")
    assistant: Optional[AssistantSchema] = Field(None, description="Assistant details")
    bus: Optional[BusSchema] = Field(None, description="Bus details")
    route: Optional[RouteSchema] = Field(default=..., description="Route details")
    secretary: Optional[SecretarySchema] = Field(default=..., description="Secretary details")

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
