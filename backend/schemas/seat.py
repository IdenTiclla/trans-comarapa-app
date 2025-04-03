from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from schemas.bus import Bus

class SeatBase(BaseModel):
    bus_id: int = Field(..., description="Bus ID", example=1, gt=0)
    deck: str = Field(..., description="Seat deck", example="A", min_length=1, max_length=10)
    seat_number: int = Field(..., description="Seat number", example=1, gt=0)

    @field_validator('deck')
    @classmethod
    def validate_deck(cls, v):
        valid_decks = ["A", "B", "C", "FIRST", "SECOND", "ECONOMY", "BUSINESS", "VIP"]
        if v not in valid_decks:
            raise ValueError(f"Invalid deck value: {v}. Valid values are: {', '.join(valid_decks)}")
        return v

    class Config:
        from_attributes = True

class SeatCreate(SeatBase):
    pass

class SeatUpdate(SeatBase):
    bus_id: Optional[int] = None
    deck: Optional[str] = None
    seat_number: Optional[int] = None

class Seat(SeatBase):
    id: int = Field(..., description="Seat ID", example=1)
    created_at: datetime = Field(..., description="Seat creation date", example=datetime.now())
    updated_at: datetime = Field(..., description="Seat update date", example=datetime.now())
    bus: Bus

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


