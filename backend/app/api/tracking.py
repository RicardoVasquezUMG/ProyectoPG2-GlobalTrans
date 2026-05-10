from fastapi import APIRouter, Depends, status
from app.models.tracking import (
    CheckpointCreate, CheckpointRead,
    PosicionUpdate, PosicionRead,
    ViajeActivoRead
)
from app.services.tracking_service import TrackingService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/tracking", tags=["tracking"])


@router.post("/{viaje_id}/checkpoint", response_model=dict, status_code=status.HTTP_201_CREATED)
async def registrar_checkpoint(
    viaje_id: str,
    data: CheckpointCreate,
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Registra un checkpoint/evento en un viaje y actualiza su estado."""
    return await TrackingService.registrar_checkpoint(viaje_id, data, user_id=user.get("id"))


@router.post("/{viaje_id}/posicion", response_model=dict)
async def actualizar_posicion(
    viaje_id: str,
    data: PosicionUpdate,
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Actualiza la posición GPS actual de un viaje. Usado por el piloto desde el navegador."""
    return await TrackingService.actualizar_posicion(viaje_id, data)


@router.get("/{viaje_id}/historial", response_model=list)
async def obtener_historial(
    viaje_id: str,
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Obtiene el historial de checkpoints de un viaje."""
    return await TrackingService.obtener_historial(viaje_id)


@router.get("/{viaje_id}/posicion", response_model=dict | None)
async def obtener_posicion(
    viaje_id: str,
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Obtiene la posición GPS actual de un viaje."""
    return await TrackingService.obtener_posicion_actual(viaje_id)


@router.get("/activos", response_model=list)
async def obtener_viajes_activos(
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))
):
    """Obtiene todos los viajes activos con su posición para el mapa de monitoreo."""
    return await TrackingService.obtener_viajes_activos()


@router.get("/detalle/{viaje_id}", response_model=dict)
async def obtener_viaje_detalle(
    viaje_id: str,
    user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Obtiene los datos completos de un viaje para la vista de detalle."""
    return await TrackingService.obtener_viaje_detalle(viaje_id)
