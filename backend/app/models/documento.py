from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentoBase(BaseModel):
    tipo: str = Field(..., max_length=50)

class DocumentoCreate(DocumentoBase):
    pass

class DocumentoRead(DocumentoBase):
    id: str
    cargamento_id: str
    url: str
    fecha_subida: datetime
    created_at: datetime
    updated_at: datetime
