from datetime import date
from pydantic import BaseModel, Field
from typing import Optional

class Passenger(BaseModel):
    name: str = Field(..., max_length=100, description='Passenger name.', example="Carlos")
    lastname: str = Field(..., max_length=100, description='Passenger lastname.', example="Rocabado")
    phone_number: str = Field(..., max_length=8, description="Passenger phone number.", example="77612322")
    birth_date:  Optional[date]  = Field(None, description="Passenger birth date (YYYY-MM-DD).", example="1998-01-29")

    class Config:
        orm_mode = True


class PatchPassenger(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description='Passenger name.', example="Carlos")
    lastname: Optional[str] = Field(None, max_length=100, description='Passenger lastname.', example="Rocabado")
    phone_number: Optional[str] = Field(None, max_length=8, description="Passenger phone number.", example="77612322")
    birth_date: Optional[date] = Field(None, description="Passenger birth date (YYYY-MM-DD).", example="1998-01-29")

    class Config:
        orm_mode = True

class Driver(BaseModel):
    name: str = Field(max_length=100, description="Driver's name")
    lastname: str = Field(max_length=100, description="Driver lastname")
    phone_number: str = Field(max_length=8, description="Driver phone number")
    birth_date: date = Field(..., description="Driver phone number.")
    license_number: str = Field(max_length=8, description="License number.")
    experience_years:  int = Field(description="Driver's years of experience")

    class Config:
        orm_mode = True

class PatchDriver(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="Driver's name")
    lastname: Optional[str] = Field(None, max_length=100, description="Driver lastname")
    phone_number: Optional[str] = Field(None, max_length=8, description="Driver phone number")
    birth_date: Optional[date] = Field(None, description="Driver phone number.")
    license_number: Optional[str] = Field(None, max_length=8, description="License number.")
    experience_years:  Optional[int] = Field(None, description="Driver's years of experience")

    class Config:
        orm_mode = True
