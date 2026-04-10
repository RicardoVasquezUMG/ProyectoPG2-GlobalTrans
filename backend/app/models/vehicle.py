from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    tipo: str
    tonelaje: float
    placas: str
    estado: Optional[str] = "Disponible"

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    tipo: Optional[str] = None
    tonelaje: Optional[float] = None
    placas: Optional[str] = None
    estado: Optional[str] = None

class VehicleRead(VehicleBase):
    id: str
    created_at: datetime
    updated_at: datetime
