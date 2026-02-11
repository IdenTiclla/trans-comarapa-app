from pydantic import BaseModel
from typing import Optional
from datetime import time

class RouteScheduleBase(BaseModel):
    departure_time: time
    is_active: bool = True

class RouteScheduleCreate(RouteScheduleBase):
    pass

class RouteScheduleUpdate(BaseModel):
    departure_time: Optional[time] = None
    is_active: Optional[bool] = None

class RouteSchedule(RouteScheduleBase):
    id: int
    route_id: int

    class Config:
        from_attributes = True
