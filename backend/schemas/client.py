from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional, Any

class ClientBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    birth_date: date

    class Config:
        from_attributes = True

class ClientCreate(ClientBase):
    """
    Schema for creating a new client
    """
    pass

class ClientUpdate(ClientBase):
    """
    Schema for updating a client
    """
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    birth_date: Optional[date] = None

class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
