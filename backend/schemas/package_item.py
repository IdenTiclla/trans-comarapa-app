from pydantic import BaseModel, Field, field_validator
from typing import Optional

class PackageItemBase(BaseModel):
    quantity: int = Field(..., ge=1, description="Cantidad del item")
    description: str = Field(..., min_length=1, max_length=500, description="Descripción detallada del item")
    unit_price: float = Field(..., ge=0, description="Precio unitario del item")
    total_price: Optional[float] = Field(None, ge=0, description="Precio total del item (calculado automáticamente)")

class PackageItemCreate(PackageItemBase):
    @field_validator('total_price', mode='before')
    @classmethod
    def calculate_total_price(cls, v, info):
        """Calcula automáticamente el precio total"""
        if info.data:
            quantity = info.data.get('quantity')
            unit_price = info.data.get('unit_price')
            if quantity is not None and unit_price is not None:
                return quantity * unit_price
        return v

class PackageItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    unit_price: Optional[float] = Field(None, ge=0)
    total_price: Optional[float] = Field(None, ge=0, description="Precio total del item")

class PackageItemResponse(PackageItemBase):
    id: int
    package_id: int

    class Config:
        from_attributes = True 