from pydantic import Field
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class DriverBase(PersonBase):
    """
    Esquema base para conductores, hereda de PersonBase.
    """
    license_number: str = Field(..., description="Driver's license number", example="LC123456")
    license_type: Optional[str] = Field(None, description="Driver's license type/category", example="A")
    experience_years: Optional[int] = Field(None, description="Driver's years of experience", example=5)

class DriverCreate(PersonCreate, DriverBase):
    """
    Esquema para crear un nuevo conductor.
    """
    pass

class DriverPatch(DriverBase):
    """
    Esquema para actualizar un conductor.
    """
    pass

    class Config:
        from_attributes = True

class Driver(PersonSchema, DriverBase):
    """
    Esquema para representar un conductor.
    """
    # Campos específicos de Driver en la respuesta (si los hubiera)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        # Excluir el campo user para evitar la recursión
        exclude = {"user"}