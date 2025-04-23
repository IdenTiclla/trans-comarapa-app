from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from schemas.user import UserCreate

class DriverWithUser(BaseModel):
    """
    Schema for creating a Driver and their associated User account together.
    """
    # Driver specific fields
    license_number: str = Field(..., description="Driver's license number", example="LC123456")
    experience_years: Optional[int] = Field(None, description="Driver's years of experience", example=5)

    # Person fields
    firstname: str = Field(..., description="Person's first name", example="John")
    lastname: str = Field(..., description="Person's last name", example="Doe")
    phone: str = Field(None, description="Person's phone number", example="12345678")
    birth_date: Optional[date] = Field(None, description="Person's birth date", example="1990-01-01")
    
    # User fields
    user: UserCreate

class DriverWithUserResponse(BaseModel):
    """
    Schema for the response after creating a Driver with User.
    """
    driver_id: int
    user_id: int
    firstname: str
    lastname: str
    phone: Optional[str]
    birth_date: Optional[date]
    license_number: str
    experience_years: Optional[int]
    username: str
    email: str
    is_active: bool
    is_admin: bool
    
    class Config:
        from_attributes = True 