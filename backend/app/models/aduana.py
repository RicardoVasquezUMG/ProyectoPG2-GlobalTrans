from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AduanaBase(BaseModel):
    nombre: str
    pais_origen: str
    pais_destino: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    is_active: Optional[bool] = True

class AduanaCreate(AduanaBase):
    pass

class AduanaUpdate(BaseModel):
    nombre: Optional[str] = None
    pais_origen: Optional[str] = None
    pais_destino: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    is_active: Optional[bool] = None

class AduanaRead(AduanaBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
