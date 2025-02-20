from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class DriverBase(BaseModel):
    name: str = Field(..., description="Driver's name", example="John")
    lastname: str = Field(..., description="Driver lastname", example="Doe")
    phone_number: str = Field(..., description="Driver phone number", example="77612322")
    birth_date: date = Field(..., description="Driver phone number.", example="1998-01-29")
    license_number: str = Field(..., description="License number.", example="12345678")
    experience_years:  int = Field(..., description="Driver's years of experience", example=5)

class DriverCreate(DriverBase):
    """
    Schema for creating a new driver.
    """
    pass

    class Config:
        orm_mode = True

class DriverPatch(DriverBase):
    """
    Schema for updating a driver.
    """
    pass


class Driver(DriverBase):
    id: int = Field(..., description="Driver identifier", example=1)

    class Config:
        orm_mode = True