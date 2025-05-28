from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional

class PersonBase(BaseModel):
    """
    Esquema base para personas (Secretary, Driver, Assistant).
    """
    firstname: str = Field(..., description="Person's first name", example="John")
    lastname: str = Field(..., description="Person's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Person's phone number", example="12345678")
    birth_date: Optional[date] = Field(None, description="Person's birth date", example="1990-01-01")
    user_id: Optional[int] = Field(None, description="ID of the associated user account", example=1)

class PersonCreate(PersonBase):
    """
    Esquema para crear una nueva persona.
    """
    pass

class Person(PersonBase):
    """
    Esquema para representar una persona.
    """
    id: int = Field(..., description="Person identifier", example=1)
    created_at: datetime = Field(..., description="Creation date", example=datetime.now())
    updated_at: datetime = Field(..., description="Last update date", example=datetime.now())

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
