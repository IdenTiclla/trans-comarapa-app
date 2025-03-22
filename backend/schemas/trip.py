"""
This module defines Pydantic schemas for Trip.
Includes examples and field descriptions.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# Base model with common attributes
class TripBase(BaseModel):
    trip_date: date = Field(..., description="Trip date (YYYY-MM-DD)", example="2023-10-01")
    driver_id: int = Field(..., description="Driver identifier", example=1)
    assistant_id: Optional[int] = Field(None, description="Assistant identifier", example=2)
    bus_id: int = Field(..., description="Bus identifier", example=3)

# Schema for creating a new trip
class TripCreate(TripBase):
    """
    Schema for creating a Trip.
    """
    pass

# Schema for reading trip details; includes id and ORM mode
class Trip(TripBase):
    id: int = Field(..., description="Trip identifier", example=1)

    class Config:
        from_attributes = True
