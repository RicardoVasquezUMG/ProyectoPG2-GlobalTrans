from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class CampaniaBase(BaseModel):
    fecha_inicio: date
    fecha_fin: date
    descripcion: str
    estado: bool = True

class CampaniaCreate(CampaniaBase):
    pass

class CampaniaUpdate(BaseModel):
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class CampaniaRead(CampaniaBase):
    id: str
    created_at: datetime
    updated_at: datetime
