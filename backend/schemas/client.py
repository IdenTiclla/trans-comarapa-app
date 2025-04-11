from pydantic import Field
from datetime import date
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class ClientBase(PersonBase):
    """
    Esquema base para clientes, hereda de PersonBase.
    """
    address: str = Field(..., description="Client's address", example="123 Main St")
    city: str = Field(..., description="Client's city", example="Springfield")
    state: str = Field(..., description="Client's state", example="IL")

class ClientCreate(PersonCreate, ClientBase):
    """
    Esquema para crear un nuevo cliente.
    """
    pass

class ClientUpdate(ClientBase):
    """
    Schema for updating a client
    """
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    birth_date: Optional[date] = None
    user_id: Optional[int] = None

class Client(PersonSchema, ClientBase):
    """
    Esquema para representar un cliente.
    """

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        # Excluir el campo user para evitar la recursión
        exclude = {"user"}
