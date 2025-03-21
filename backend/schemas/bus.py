from pydantic import BaseModel, Field


class BusCreate(BaseModel):
    license_plate: str = Field(..., description="Bus Unique license plate", example="2312ABX")
    capacity: int = Field(..., description="Bus Capacity", example=45)
    model: str = Field(..., description="Bus model", example="Nissan")

    class Config:
        from_attributes = True