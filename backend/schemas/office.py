from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class OfficeBase(BaseModel):
    name: str
    location_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    manager_name: Optional[str] = None

class OfficeCreate(OfficeBase):
    pass

class OfficeUpdate(BaseModel):
    name: Optional[str] = None
    location_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    manager_name: Optional[str] = None

class OfficeResponse(OfficeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
