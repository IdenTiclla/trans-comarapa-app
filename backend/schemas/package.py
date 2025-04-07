from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from schemas.client import Client
from schemas.trip import Trip
from schemas.secretary import Secretary

class PackageBase(BaseModel):
    name: str = Field(..., description="Package name", example="Electronics")
    description: Optional[str] = Field(None, description="Package description", example="A box of electronics")
    weight: float = Field(..., description="Weight of the package in kg", example=1.5)
    price: float = Field(..., description="Price of the package", example=100.0)
    status: str = Field(..., description="Current status of the package", example="In Transit")
    sender_id: Optional[int] = Field(None, description="ID of the sender", example=1)
    recipient_id: Optional[int] = Field(None, description="ID of the recipient", example=2)
    trip_id: Optional[int] = Field(None, description="ID of the trip associated with the package", example=3)
    secretary_id: Optional[int] = Field(None, description="ID of the secretary", example=4)

class PackageCreate(PackageBase):
    pass

class PackageUpdate(PackageBase):
    name: Optional[str] = None
    description: Optional[str] = None
    weight: Optional[float] = None
    price: Optional[float] = None
    status: Optional[str] = None
    sender_id: Optional[int] = None
    recipient_id: Optional[int] = None
    trip_id: Optional[int] = None

class Package(PackageBase):
    id: int = Field(..., description="Package ID", example=1)
    created_at: datetime = Field(..., description="Creation date of the package", example=datetime.now())
    updated_at: datetime = Field(..., description="Last update date of the package", example=datetime.now())

    sender: Optional[Client] = None
    recipient: Optional[Client] = None
    trip: Optional[Trip] = None
    secretary: Optional[Secretary] = None
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True  