from datetime import date
from pydantic import BaseModel, Field
from typing import Optional

class PassengerCreate(BaseModel):
    name: str = Field(..., max_length=100, description='Passenger name.', example="Carlos")
    lastname: str = Field(..., max_length=100, description='Passenger lastname.', example="Rocabado")
    phone_number: str = Field(..., max_length=8, description="Passenger phone number.", example="77612322")
    birth_date:  Optional[date]  = Field(None, description="Passenger birth date (YYYY-MM-DD).", example="1998-01-29")

    class Config:
        from_attributes = True

class PassengerPatch(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description='Passenger name.', example="Carlos")
    lastname: Optional[str] = Field(None, max_length=100, description='Passenger lastname.', example="Rocabado")
    phone_number: Optional[str] = Field(None, max_length=8, description="Passenger phone number.", example="77612322")
    birth_date: Optional[date] = Field(None, description="Passenger birth date (YYYY-MM-DD).", example="1998-01-29")

    class Config:
        from_attributes = True