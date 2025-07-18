from pydantic import BaseModel, Field
from typing import Optional


class BusBase(BaseModel):
    license_plate: str = Field(..., description="Bus Unique license plate", example="2312ABX")
    capacity: int = Field(..., description="Bus Capacity", example=45)
    model: str = Field(..., description="Bus model", example="Nissan")
    brand: Optional[str] = Field(None, description="Bus brand", example="Mercedes")
    color: Optional[str] = Field(None, description="Bus color", example="Azul")

class BusCreate(BusBase):
    """
    Schema for creating a Bus.
    """
    pass

class Bus(BusBase):
    """
    Schema for reading Bus details; includes id and ORM mode
    """
    id: int = Field(..., description="Bus identifier", example=1)

    class Config:
        from_attributes = True