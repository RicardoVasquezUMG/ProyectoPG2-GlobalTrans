from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ViajeBase(BaseModel):
    fecha_plan_salida: datetime
    observaciones: Optional[str] = None
    cargamento_id: str
    vehiculo_id: str
    tienda_id: str
    usuario_id: str

class ViajeCreate(ViajeBase):
    pass

class ViajeUpdate(BaseModel):
    fecha_plan_salida: Optional[datetime] = None
    observaciones: Optional[str] = None
    cargamento_id: Optional[str] = None
    vehiculo_id: Optional[str] = None
    tienda_id: Optional[str] = None
    usuario_id: Optional[str] = None

class ViajeRead(ViajeBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Campos adicionales para la vista en el frontend (joins)
    numero_contenedor: Optional[str] = None
    placa_vehiculo: Optional[str] = None
    nombre_tienda: Optional[str] = None
    nombre_piloto: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
