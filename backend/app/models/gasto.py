from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GastoViajeBase(BaseModel):
    viaje_id: str
    flete_base: float = 0.0
    multas_aduana: float = 0.0
    viaticos_extra: float = 0.0
    parqueo_almacenaje: float = 0.0
    otros_imprevistos: float = 0.0
    notas: Optional[str] = None

class GastoViajeCreate(GastoViajeBase):
    pass

class GastoViajeUpdate(BaseModel):
    flete_base: Optional[float] = None
    multas_aduana: Optional[float] = None
    viaticos_extra: Optional[float] = None
    parqueo_almacenaje: Optional[float] = None
    otros_imprevistos: Optional[float] = None
    notas: Optional[str] = None

class GastoViajeRead(GastoViajeBase):
    id: str
    total_sobrecostos: float = 0.0
    total_gasto: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
