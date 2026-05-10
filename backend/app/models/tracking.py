from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckpointCreate(BaseModel):
    """Datos para registrar un nuevo checkpoint en un viaje."""
    estado: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    ubicacion_nombre: Optional[str] = None
    pais: Optional[str] = None
    notas: Optional[str] = None


class CheckpointRead(BaseModel):
    """Checkpoint/evento de un viaje."""
    id: str
    viaje_id: str
    estado: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    ubicacion_nombre: Optional[str] = None
    pais: Optional[str] = None
    notas: Optional[str] = None
    registrado_por: Optional[str] = None
    fecha_evento: Optional[datetime] = None
    created_at: Optional[datetime] = None


class PosicionUpdate(BaseModel):
    """Datos de posición GPS enviados desde el navegador del piloto."""
    latitud: float
    longitud: float
    velocidad: Optional[float] = None
    rumbo: Optional[float] = None
    precision_gps: Optional[float] = None


class PosicionRead(BaseModel):
    """Posición actual de un viaje."""
    viaje_id: str
    latitud: float
    longitud: float
    velocidad: Optional[float] = None
    rumbo: Optional[float] = None
    precision_gps: Optional[float] = None
    fecha_actualizacion: Optional[datetime] = None


class ViajeActivoRead(BaseModel):
    """Viaje activo con su posición actual para el mapa de monitoreo."""
    id: str
    estado: str
    fecha_plan_salida: Optional[datetime] = None
    nombre_piloto: Optional[str] = None
    placa_vehiculo: Optional[str] = None
    nombre_tienda: Optional[str] = None
    pais_destino: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    velocidad: Optional[float] = None
    fecha_actualizacion: Optional[datetime] = None
