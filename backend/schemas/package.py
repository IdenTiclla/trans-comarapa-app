from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from schemas.client import Client
from schemas.trip import Trip
from schemas.secretary import Secretary
from schemas.package_item import PackageItemCreate, PackageItemResponse

class PackageBase(BaseModel):
    tracking_number: str = Field(..., description="Número de encomienda único", example="003589")
    total_weight: Optional[float] = Field(None, description="Peso total del paquete en kg", example=5.2)
    total_declared_value: Optional[float] = Field(None, description="Valor declarado total", example=500.0)
    notes: Optional[str] = Field(None, description="Observaciones adicionales", example="Frágil - manejar con cuidado")
    status: str = Field(default="registered", description="Estado del paquete", example="registered")
    
    sender_id: int = Field(..., description="ID del remitente", example=1)
    recipient_id: int = Field(..., description="ID del destinatario", example=2)
    trip_id: int = Field(..., description="ID del viaje", example=3)

class PackageCreate(PackageBase):
    items: List[PackageItemCreate] = Field(..., description="Lista de items del paquete", min_items=1)
    secretary_id: int = Field(..., description="ID de la secretaria que registra", example=1, gt=0)
    
    @validator('tracking_number')
    def validate_tracking_number(cls, v):
        """Valida el formato del número de encomienda"""
        if not v or len(v) < 3:
            raise ValueError('El número de encomienda debe tener al menos 3 caracteres')
        return v.upper().strip()

class PackageUpdate(BaseModel):
    tracking_number: Optional[str] = Field(None, description="Número de encomienda")
    total_weight: Optional[float] = Field(None, ge=0)
    total_declared_value: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    status: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class PackageResponse(PackageBase):
    id: int = Field(..., description="ID del paquete", example=1)
    secretary_id: int = Field(..., description="ID de la secretaria", example=4)
    
    # Fechas y horarios
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de última actualización")
    departure_time: Optional[datetime] = Field(None, description="Hora de salida")
    arrival_time: Optional[datetime] = Field(None, description="Hora de llegada")
    delivered_at: Optional[datetime] = Field(None, description="Fecha de entrega")
    
    # Campos calculados
    total_amount: float = Field(..., description="Monto total calculado")
    total_items_count: int = Field(..., description="Cantidad total de items")
    
    # Relaciones
    items: List[PackageItemResponse] = Field(default=[], description="Items del paquete")
    sender: Optional[Client] = None
    recipient: Optional[Client] = None
    trip: Optional[Trip] = None
    secretary: Optional[Secretary] = None
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# Esquema simplificado para listados
class PackageSummary(BaseModel):
    id: int
    tracking_number: str
    status: str
    total_amount: float
    total_items_count: int
    sender_name: Optional[str] = None
    recipient_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True  