from pydantic import BaseModel, constr, Field
from typing import Optional
from datetime import datetime

class FurgonBase(BaseModel):
    numero_contenedor: str = Field(..., max_length=20)
    codigo_tamano_tipo: str = Field(..., max_length=10)
    peso_bruto_maximo: float
    peso_tara: float
    carga_util: float
    codigo_propietario: str = Field(..., max_length=4, min_length=4)

class FurgonCreate(FurgonBase):
    pass

class FurgonUpdate(BaseModel):
    numero_contenedor: Optional[str] = Field(None, max_length=20)
    codigo_tamano_tipo: Optional[str] = Field(None, max_length=10)
    peso_bruto_maximo: Optional[float] = None
    peso_tara: Optional[float] = None
    carga_util: Optional[float] = None
    codigo_propietario: Optional[str] = Field(None, max_length=4, min_length=4)

class FurgonRead(FurgonBase):
    id: str
    created_at: datetime
    updated_at: datetime
