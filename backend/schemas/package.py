from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List
from schemas.client import Client
from schemas.trip import Trip
from schemas.secretary import Secretary
from schemas.package_item import PackageItemCreate, PackageItemResponse
from core.enums import PackageStatus, PackagePaymentStatus, PaymentMethod

# Valid package statuses (derived from enum)
VALID_STATUSES = [s.value for s in PackageStatus]
VALID_PAYMENT_STATUSES = [s.value for s in PackagePaymentStatus]
VALID_PAYMENT_METHODS = [m.value for m in PaymentMethod]

class PackageStateHistorySchema(BaseModel):
    id: int
    package_id: int
    old_state: Optional[str] = None
    new_state: str
    changed_at: datetime
    changed_by_user_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)


class PackageItemPreview(BaseModel):
    id: int
    description: str
    quantity: int
    unit_price: float
    total_price: float
    
    model_config = ConfigDict(from_attributes=True)

class PackageBase(BaseModel):
    tracking_number: str = Field(..., description="Número de encomienda único", json_schema_extra={"example": "003589"})
    total_weight: Optional[float] = Field(None, description="Peso total del paquete en kg", json_schema_extra={"example": 5.2})
    total_declared_value: Optional[float] = Field(None, description="Valor declarado total", json_schema_extra={"example": 500.0})
    notes: Optional[str] = Field(None, description="Observaciones adicionales", json_schema_extra={"example": "Frágil - manejar con cuidado"})
    status: str = Field(default="registered_at_office", description="Estado del paquete", json_schema_extra={"example": "registered_at_office"})
    
    sender_id: int = Field(..., description="ID del remitente", json_schema_extra={"example": 1})
    recipient_id: int = Field(..., description="ID del destinatario", json_schema_extra={"example": 2})
    trip_id: Optional[int] = Field(None, description="ID del viaje (opcional, se asigna después)", json_schema_extra={"example": 3})
    
    payment_status: str = Field(default="paid_on_send", description="Estado de pago", json_schema_extra={"example": "paid_on_send"})
    payment_method: Optional[str] = Field(None, description="Método de pago", json_schema_extra={"example": "qr"})

    @field_validator('payment_status')
    @classmethod
    def validate_payment_status(cls, v):
        if v not in VALID_PAYMENT_STATUSES:
            raise ValueError(f'Estado de pago inválido. Estados válidos: {", ".join(VALID_PAYMENT_STATUSES)}')
        return v
    
    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v):
        if v and v not in VALID_PAYMENT_METHODS:
            raise ValueError(f'Método de pago inválido. Métodos válidos: {", ".join(VALID_PAYMENT_METHODS)}')
        return v


class PackageCreate(PackageBase):
    items: List[PackageItemCreate] = Field(..., description="Lista de items del paquete", min_length=1)
    secretary_id: int = Field(..., description="ID de la secretaria que registra", json_schema_extra={"example": 1}, gt=0)
    trip_id: Optional[int] = Field(None, description="ID del viaje (opcional)")
    
    @field_validator('tracking_number')
    @classmethod
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
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None

class PackageAssignTrip(BaseModel):
    """Schema para asignar una encomienda a un viaje"""
    trip_id: int = Field(..., description="ID del viaje a asignar", gt=0)

class PackageStatusUpdate(BaseModel):
    """Schema para actualizar el estado de una encomienda"""
    new_status: str = Field(..., description="Nuevo estado del paquete")
    changed_by_user_id: Optional[int] = Field(None, description="ID del usuario que realiza el cambio")
    
    @field_validator('new_status')
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f'Estado inválido. Estados válidos: {", ".join(VALID_STATUSES)}')
        return v

class PackageDeliverRequest(BaseModel):
    """Schema para entregar una encomienda"""
    payment_method: str = Field(..., description="Método de pago usado al entregar (cash/qr)")
    changed_by_user_id: Optional[int] = Field(None, description="ID del usuario que realiza la entrega")

    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v):
        if v not in VALID_PAYMENT_METHODS:
            raise ValueError(f'Método de pago inválido. Métodos válidos: {", ".join(VALID_PAYMENT_METHODS)}')
        return v

class PackageResponse(PackageBase):
    id: int = Field(..., description="ID del paquete", json_schema_extra={"example": 1})
    secretary_id: int = Field(..., description="ID de la secretaria", json_schema_extra={"example": 4})
    
    # Fechas y horarios
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de última actualización")
    
    # Campos calculados
    total_amount: float = Field(..., description="Monto total calculado")
    total_items_count: int = Field(..., description="Cantidad total de items")
    
    # Relaciones
    items: List[PackageItemResponse] = Field(default=[], description="Items del paquete")
    state_history: List[PackageStateHistorySchema] = Field(default=[], description="Historial de estados")
    sender: Optional[Client] = None
    recipient: Optional[Client] = None
    trip: Optional[Trip] = None
    secretary: Optional[Secretary] = None
    
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

# Esquema simplificado para listados
class PackageSummary(BaseModel):
    id: int
    tracking_number: str
    status: str
    total_amount: float
    total_items_count: int
    sender_name: Optional[str] = None
    recipient_name: Optional[str] = None
    trip_id: Optional[int] = None
    payment_status: str
    payment_method: Optional[str] = None
    created_at: datetime
    items: List[PackageItemPreview] = []
    
    model_config = ConfigDict(from_attributes=True)  