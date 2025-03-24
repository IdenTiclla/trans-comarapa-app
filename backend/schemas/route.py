from pydantic import BaseModel, Field
from typing import Optional
from .location import Location

class RouteBase(BaseModel):
    origin_location_id: int = Field(..., description="ID of the origin location")
    destination_location_id: int = Field(..., description="ID of the destination location")
    distance: float = Field(..., gt=0, description="Distance in kilometers", example=240.5)
    duration: float = Field(..., gt=0, description="Duration in hours", example=4.5)
    price: float = Field(..., gt=0, description="Price in bolivianos", example=35.0)

class RouteCreate(RouteBase):
    """
    Schema for creating a new route
    """
    pass

class RouteUpdate(BaseModel):
    """
    Schema for updating a route
    """
    origin_location_id: Optional[int] = None
    destination_location_id: Optional[int] = None
    distance: Optional[float] = Field(None, gt=0)
    duration: Optional[float] = Field(None, gt=0)
    price: Optional[float] = Field(None, gt=0)

class Route(RouteBase):
    """
    Schema for reading a route, includes relationships
    """
    id: int
    origin_location: Location
    destination_location: Location

    class Config:
        from_attributes = True
