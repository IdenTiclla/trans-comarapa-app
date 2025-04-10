from pydantic import Field
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class AssistantBase(PersonBase):
    """
    Esquema base para asistentes, hereda de PersonBase.
    """
    # Campos específicos de Assistant (si los hubiera)
    # certification: Optional[str] = Field(None, description="Assistant's certification", example="First Aid")
    pass

class AssistantCreate(PersonCreate, AssistantBase):
    """
    Esquema para crear un nuevo asistente.
    """
    pass

class Assistant(PersonSchema, AssistantBase):
    """
    Esquema para representar un asistente.
    """
    # Campos específicos de Assistant en la respuesta (si los hubiera)

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        # Excluir el campo user para evitar la recursión
        exclude = {"user"}
