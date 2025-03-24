from pydantic import BaseModel, Field, field_validator
from typing import Optional
from decimal import Decimal

class LocationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Location name", example="Terminal Bimodal")
    latitude: float = Field(..., description="Latitude coordinate", example=-17.783333)
    longitude: float = Field(..., description="Longitude coordinate", example=-63.182222)
    address: Optional[str] = Field(None, max_length=200, description="Full address", example="Av. Omar Chávez Ortiz")
    city: Optional[str] = Field(None, max_length=100, description="City name", example="Santa Cruz de la Sierra")
    state: Optional[str] = Field(None, max_length=100, description="State/Department name", example="Santa Cruz")
    country: str = Field(default="Bolivia", max_length=100, description="Country name")
    postal_code: Optional[str] = Field(None, max_length=10, description="Postal code")
    description: Optional[str] = Field(None, max_length=500, description="Location description")

    @field_validator('latitude')
    def validate_latitude(cls, v):
        if v < -90 or v > 90:
            raise ValueError('Latitude must be between -90 and 90 degrees')
        return v

    @field_validator('longitude')
    def validate_longitude(cls, v):
        if v < -180 or v > 180:
            raise ValueError('Longitude must be between -180 and 180 degrees')
        return v

class LocationCreate(LocationBase):
    """Schema for creating a new location"""
    pass

class LocationUpdate(BaseModel):
    """Schema for updating a location"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = Field(None, max_length=500)

    @field_validator('latitude')
    def validate_latitude(cls, v):
        if v is not None and (v < -90 or v > 90):
            raise ValueError('Latitude must be between -90 and 90 degrees')
        return v

    @field_validator('longitude')
    def validate_longitude(cls, v):
        if v is not None and (v < -180 or v > 180):
            raise ValueError('Longitude must be between -180 and 180 degrees')
        return v

class Location(LocationBase):
    """Schema for reading a location"""
    id: int = Field(..., description="Location identifier")

    class Config:
        from_attributes = True