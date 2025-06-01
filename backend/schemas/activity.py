from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema base para Activity
class ActivityBase(BaseModel):
    activity_type: str
    details: Optional[str] = None
    user_id: Optional[int] = None # Opcional, podría ser una actividad del sistema

# Esquema para la creación de una Activity (usado al recibir datos en un POST)
class ActivityCreate(ActivityBase):
    pass

# Esquema para leer una Activity (usado al retornar datos de la API)
class Activity(ActivityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # Para FastAPI v2 / Pydantic v2. Usa orm_mode = True para Pydantic v1

# Esquema para la respuesta de la lista de actividades
class ActivityListResponse(BaseModel):
    activities: list[Activity]
    total: int 