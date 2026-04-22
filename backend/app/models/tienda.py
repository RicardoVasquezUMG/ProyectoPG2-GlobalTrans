from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TiendaBase(BaseModel):
    nombre: str
    pais: str
    direccion: str
    estado: bool = True

class TiendaCreate(TiendaBase):
    pass

class TiendaUpdate(BaseModel):
    nombre: Optional[str] = None
    pais: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None

class TiendaRead(TiendaBase):
    id: str
    created_at: datetime
    updated_at: datetime
