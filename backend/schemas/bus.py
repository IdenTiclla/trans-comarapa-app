from pydantic import BaseModel, Field
from typing import Optional, List


class BusBase(BaseModel):
    license_plate: str = Field(..., description="Bus Unique license plate", example="2312ABX")
    capacity: int = Field(..., description="Bus Capacity", example=45)
    model: str = Field(..., description="Bus model", example="Nissan")
    brand: Optional[str] = Field(None, description="Bus brand", example="Mercedes")
    color: Optional[str] = Field(None, description="Bus color", example="Azul")
    floors: int = Field(1, ge=1, le=2, description="Number of floors (1 or 2)", example=1)


class BusCreate(BusBase):
    """
    Schema for creating a Bus.
    """
    pass


class BusUpdate(BaseModel):
    """
    Schema for updating a Bus. All fields are optional.
    """
    license_plate: Optional[str] = Field(None, description="Bus Unique license plate", example="2312ABX")
    capacity: Optional[int] = Field(None, description="Bus Capacity", example=45)
    model: Optional[str] = Field(None, description="Bus model", example="Nissan")
    brand: Optional[str] = Field(None, description="Bus brand", example="Mercedes")
    color: Optional[str] = Field(None, description="Bus color", example="Azul")
    floors: Optional[int] = Field(None, ge=1, le=2, description="Number of floors (1 or 2)", example=1)


class Bus(BusBase):
    """
    Schema for reading Bus details; includes id and ORM mode
    """
    id: int = Field(..., description="Bus identifier", example=1)

    class Config:
        from_attributes = True


class SeatLayoutItem(BaseModel):
    """
    Schema for a seat position in the bus layout.
    """
    seat_number: int = Field(..., ge=1, description="Seat number", example=1)
    deck: str = Field(..., pattern="^(FIRST|SECOND)$", description="Deck (FIRST or SECOND)", example="FIRST")
    row: int = Field(..., ge=1, description="Row number", example=1)
    column: int = Field(..., ge=1, le=4, description="Column number (1-4)", example=1)


class BusWithSeatsCreate(BusBase):
    """
    Schema for creating a Bus with its seat layout.
    """
    seats: List[SeatLayoutItem] = Field(..., description="List of seats with their positions")