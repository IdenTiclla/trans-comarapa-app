from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class ClientBase(BaseModel):
    """
    Esquema base para clientes.
    """
    firstname: str = Field(..., description="Client's first name", example="Juan")
    lastname: str = Field(..., description="Client's last name", example="Pérez")
    document_id: Optional[str] = Field(None, description="Client's document ID (CI)", example="1234567")
    phone: Optional[str] = Field(None, description="Client's phone number", example="70123456")
    email: Optional[str] = Field(None, description="Client's email", example="juan@email.com")
    birth_date: Optional[date] = Field(None, description="Client's birth date", example="1990-01-01")
    is_minor: Optional[bool] = Field(False, description="Whether the client is a minor", example=False)
    address: Optional[str] = Field(None, description="Client's address", example="123 Main St")
    city: Optional[str] = Field(None, description="Client's city", example="Comarapa")
    state: Optional[str] = Field(None, description="Client's state", example="Santa Cruz")

class ClientCreate(ClientBase):
    """
    Esquema para crear un nuevo cliente.
    """
    pass

class ClientUpdate(BaseModel):
    """
    Schema for updating a client
    """
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    document_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    birth_date: Optional[date] = None
    is_minor: Optional[bool] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class Client(ClientBase):
    """
    Esquema para representar un cliente.
    """
    id: int = Field(..., description="Client identifier", example=1)
    created_at: datetime = Field(..., description="Creation date", example=datetime.now())
    updated_at: datetime = Field(..., description="Last update date", example=datetime.now())

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
