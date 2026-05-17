from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# Estados válidos del viaje
ESTADOS_VIAJE = ['planificado', 'en_ruta', 'en_aduana', 'entregado', 'retrasado', 'cancelado']

class ViajeBase(BaseModel):
    fecha_plan_salida: datetime
    observaciones: Optional[str] = None
    cargamento_id: str
    vehiculo_id: str
    tienda_id: str
    usuario_id: str
    estado: Optional[str] = 'planificado'
    fecha_esperada_llegada: Optional[datetime] = None
    fecha_llegada_real: Optional[datetime] = None

class ViajeCreate(ViajeBase):
    pass

class ViajeUpdate(BaseModel):
    fecha_plan_salida: Optional[datetime] = None
    observaciones: Optional[str] = None
    cargamento_id: Optional[str] = None
    vehiculo_id: Optional[str] = None
    tienda_id: Optional[str] = None
    usuario_id: Optional[str] = None
    estado: Optional[str] = None

class ViajeRead(ViajeBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    estado: Optional[str] = 'planificado'

    # Campos adicionales para la vista en el frontend (joins)
    numero_contenedor: Optional[str] = None
    placa_vehiculo: Optional[str] = None
    nombre_tienda: Optional[str] = None
    tienda_latitud: Optional[str] = None
    tienda_longitud: Optional[str] = None
    nombre_piloto: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
