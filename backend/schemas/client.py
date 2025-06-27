from pydantic import BaseModel, Field, computed_field
from datetime import date, datetime
from typing import Optional
from schemas.person import PersonCreate, PersonResponse, PersonUpdate, ClientResponse, ClientUpdate as PersonClientUpdate

# Esquemas de creación específicos para Client
class ClientCreate(PersonCreate):
    """
    Esquema para crear un nuevo cliente.
    """
    document_id: Optional[str] = Field(None, description="Client's document ID (CI)", example="1234567")
    address: Optional[str] = Field(None, description="Client's address", example="123 Main St")
    city: Optional[str] = Field(None, description="Client's city", example="Comarapa")
    state: Optional[str] = Field(None, description="Client's state", example="Santa Cruz")

# Usar los esquemas unificados de person.py
ClientUpdate = PersonClientUpdate

# Schema de respuesta actualizado
class ClientResponse(BaseModel):
    """
    Esquema de respuesta para clientes con campos calculados.
    """
    id: int
    document_id: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # 🆕 CAMPOS CALCULADOS
    email: Optional[str] = None        # Computed from User
    age: Optional[int] = None          # Computed from birth_date
    is_minor: bool = False             # Computed from age
    age_category: str = "unknown"      # Computed age category
    full_name: str = ""                # Computed full name
    initials: str = ""                 # Computed initials
    
    class Config:
        from_attributes = True

# Alias para compatibilidad hacia atrás
Client = ClientResponse

# Esquemas legacy para compatibilidad - DEPRECADOS
class ClientBase(BaseModel):
    """
    Esquema base para clientes - LEGACY/DEPRECADO.
    ⚠️ USAR ClientResponse EN SU LUGAR.
    Los campos email e is_minor ahora son calculados automáticamente.
    """
    firstname: str = Field(..., description="Client's first name", example="Juan")
    lastname: str = Field(..., description="Client's last name", example="Pérez")
    document_id: Optional[str] = Field(None, description="Client's document ID (CI)", example="1234567")
    phone: Optional[str] = Field(None, description="Client's phone number", example="70123456")
    
    # 🔧 CAMPOS DEPRECADOS - ahora son propiedades calculadas
    email: Optional[str] = Field(None, description="DEPRECADO: email obtenido desde User", example="juan@email.com")
    is_minor: Optional[bool] = Field(False, description="DEPRECADO: calculado desde birth_date", example=False)
    
    birth_date: Optional[date] = Field(None, description="Client's birth date", example="1990-01-01")
    address: Optional[str] = Field(None, description="Client's address", example="123 Main St")
    city: Optional[str] = Field(None, description="Client's city", example="Comarapa")
    state: Optional[str] = Field(None, description="Client's state", example="Santa Cruz")
