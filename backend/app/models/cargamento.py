from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

EstadoCargamento = Literal['creado', 'procesando', 'preparado', 'conciliado']

class CargamentoBase(BaseModel):
    furgon_id: str
    campania_id: str
    estado: EstadoCargamento = 'creado'

class CargamentoCreate(BaseModel):
    furgon_id: str
    campania_id: str

class CargamentoUpdate(BaseModel):
    estado: EstadoCargamento

class CargamentoRead(CargamentoBase):
    id: str
    fecha_creacion: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class CargamentoReadWithRelations(CargamentoRead):
    numero_contenedor: Optional[str] = None
    descripcion_campania: Optional[str] = None
