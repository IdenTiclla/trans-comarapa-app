from pydantic import Field
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class AdministratorBase(PersonBase):
    """
    Esquema base para administradores, hereda de PersonBase.
    """
    # No hay campos específicos para Administrator
    pass

class AdministratorCreate(PersonCreate, AdministratorBase):
    """
    Esquema para crear un nuevo administrador.
    """
    pass

class Administrator(PersonSchema, AdministratorBase):
    """
    Esquema para representar un administrador.
    """
    # Campos específicos de Administrator en la respuesta (si los hubiera)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        # Excluir el campo user para evitar la recursión
        exclude = {"user"}
