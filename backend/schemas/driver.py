from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class DriverCreate(BaseModel):
    name: str = Field(max_length=100, description="Driver's name")
    lastname: str = Field(max_length=100, description="Driver lastname")
    phone_number: str = Field(max_length=8, description="Driver phone number")
    birth_date: date = Field(..., description="Driver phone number.")
    license_number: str = Field(max_length=8, description="License number.")
    experience_years:  int = Field(description="Driver's years of experience")

    class Config:
        orm_mode = True

class DriverPatch(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="Driver's name")
    lastname: Optional[str] = Field(None, max_length=100, description="Driver lastname")
    phone_number: Optional[str] = Field(None, max_length=8, description="Driver phone number")
    birth_date: Optional[date] = Field(None, description="Driver phone number.")
    license_number: Optional[str] = Field(None, max_length=8, description="License number.")
    experience_years:  Optional[int] = Field(None, description="Driver's years of experience")

    class Config:
        orm_mode = True
