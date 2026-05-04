from fastapi import APIRouter, Depends, status
from app.models.viaje import ViajeCreate, ViajeRead, ViajeUpdate
from app.services.viaje_service import ViajeService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/viajes", tags=["viajes"])

@router.get("/", response_model=list[ViajeRead])
async def list_viajes(user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Lista todos los viajes."""
    return await ViajeService.get_all()

@router.post("/", response_model=ViajeRead, status_code=status.HTTP_201_CREATED)
async def create_viaje(data: ViajeCreate, user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Crea un nuevo viaje."""
    return await ViajeService.create(data)

@router.put("/{viaje_id}", response_model=ViajeRead)
async def update_viaje(viaje_id: str, data: ViajeUpdate, user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Actualiza un viaje existente."""
    return await ViajeService.update(viaje_id, data)

@router.delete("/{viaje_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_viaje(viaje_id: str, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Elimina un viaje. Solo ADMIN."""
    await ViajeService.delete(viaje_id)
