from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from schemas.person import PersonBase, PersonCreate, PersonResponse, PersonUpdate, DriverResponse, DriverUpdate

# Esquemas de creación específicos para Driver
class DriverCreate(PersonCreate):
    """
    Esquema para crear un nuevo conductor.
    """
    license_number: Optional[str] = Field(None, description="Driver's license number", json_schema_extra={"example": "LC123456"})
    license_type: Optional[str] = Field(None, description="Driver's license type/category", json_schema_extra={"example": "A"})
    license_expiry: Optional[date] = Field(None, description="License expiry date")
    status: Optional[str] = Field(None, description="Driver status", json_schema_extra={"example": "active"})

# Alias para compatibilidad hacia atrás
Driver = DriverResponse
DriverPatch = DriverUpdate

class DriverBase(PersonBase):
    """
    Esquema base para conductores - LEGACY, usar DriverResponse en su lugar.
    """
    license_number: Optional[str] = Field(None, description="Driver's license number", json_schema_extra={"example": "LC123456"})
    license_type: Optional[str] = Field(None, description="Driver's license type/category", json_schema_extra={"example": "A"})
    license_expiry: Optional[date] = Field(None, description="License expiry date")
    status: Optional[str] = Field(None, description="Driver status", json_schema_extra={"example": "active"})