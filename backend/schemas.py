from datetime import date
from pydantic import BaseModel, Field
from typing import Optional

class Passenger(BaseModel):
    name: str = Field(..., max_length=100, description='Passenger name.')
    lastname: str = Field(..., max_length=100, description='Passenger lastname.')
    phone_number: str = Field(..., max_length=8, description="Passenger phone number.")
    birth_date:  Optional[date]  = Field(None, description="Passenger birth date (YYYY-MM-DD).")

    class Config:
        orm_mode = True


class PatchPassenger(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description='Passenger name.')
    lastname: Optional[str] = Field(None, max_length=100, description='Passenger lastname.')
    phone_number: Optional[str] = Field(None, max_length=8, description="Passenger phone number.")
    birth_date: Optional[date] = Field(None, description="Passenger birth date (YYYY-MM-DD).")

    class Config:
        orm_mode = True