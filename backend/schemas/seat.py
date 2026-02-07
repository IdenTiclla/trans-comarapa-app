from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from schemas.bus import Bus


class SeatBase(BaseModel):
    bus_id: int = Field(..., description="Bus ID", example=1, gt=0)
    deck: str = Field(..., description="Seat deck", example="FIRST", min_length=1, max_length=10)
    seat_number: int = Field(..., description="Seat number", example=1, gt=0)
    row: int = Field(..., ge=1, description="Row number", example=1)
    column: int = Field(..., ge=1, le=4, description="Column number (1-4)", example=1)

    @field_validator('deck')
    @classmethod
    def validate_deck(cls, v):
        valid_decks = ["FIRST", "SECOND"]
        if v not in valid_decks:
            raise ValueError(f"Invalid deck value: {v}. Valid values are: {', '.join(valid_decks)}")
        return v

    class Config:
        from_attributes = True


class SeatCreate(SeatBase):
    pass


class SeatUpdate(BaseModel):
    bus_id: Optional[int] = Field(None, description="Bus ID", example=1, gt=0)
    deck: Optional[str] = Field(None, description="Seat deck", example="FIRST", min_length=1, max_length=10)
    seat_number: Optional[int] = Field(None, description="Seat number", example=1, gt=0)
    row: Optional[int] = Field(None, ge=1, description="Row number", example=1)
    column: Optional[int] = Field(None, ge=1, le=4, description="Column number (1-4)", example=1)

    @field_validator('deck')
    @classmethod
    def validate_deck(cls, v):
        if v is None:
            return v
        valid_decks = ["FIRST", "SECOND"]
        if v not in valid_decks:
            raise ValueError(f"Invalid deck value: {v}. Valid values are: {', '.join(valid_decks)}")
        return v


class Seat(SeatBase):
    id: int = Field(..., description="Seat ID", example=1)
    created_at: datetime = Field(..., description="Seat creation date", example=datetime.now())
    updated_at: datetime = Field(..., description="Seat update date", example=datetime.now())
    bus: Bus

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class SeatSimple(BaseModel):
    """
    Simplified seat schema without bus relationship.
    """
    id: int = Field(..., description="Seat ID", example=1)
    seat_number: int = Field(..., description="Seat number", example=1)
    deck: str = Field(..., description="Seat deck", example="FIRST")
    row: int = Field(..., description="Row number", example=1)
    column: int = Field(..., description="Column number", example=1)

    class Config:
        from_attributes = True


