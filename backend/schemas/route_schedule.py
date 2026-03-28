from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import time

class RouteScheduleBase(BaseModel):
    departure_time: time = Field(..., description="Departure time", json_schema_extra={"example": "08:30:00"})
    is_active: bool = Field(True, description="Whether the schedule is active")

class RouteScheduleCreate(RouteScheduleBase):
    pass

class RouteScheduleUpdate(BaseModel):
    departure_time: Optional[time] = None
    is_active: Optional[bool] = None

class RouteSchedule(RouteScheduleBase):
    id: int
    route_id: int

    model_config = ConfigDict(from_attributes=True)
