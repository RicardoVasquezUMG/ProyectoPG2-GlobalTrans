from fastapi import APIRouter, Depends, status
from app.models.viaje import ViajeCreate, ViajeRead, ViajeUpdate
from app.services.viaje_service import ViajeService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/viajes", tags=["viajes"])

@router.get("/", response_model=list[ViajeRead])
async def list_viajes(usuario_id: str = None, user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))):
    """Lista todos los viajes. Si se proporciona usuario_id (ej. piloto), solo devuelve los suyos."""
    return await ViajeService.get_all(user_id=usuario_id)

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

@router.get("/{viaje_id}/gastos")
async def get_gastos_viaje(viaje_id: str, user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Obtiene el desglose de gastos y sobrecostos operativos del viaje."""
    from app.services.gasto_service import GastoService
    return await GastoService.get_by_viaje(viaje_id)

@router.post("/{viaje_id}/gastos")
async def save_gastos_viaje(viaje_id: str, data: dict, user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Registra y totaliza costos operativos (flete base, multas, viáticos, almacenaje)."""
    from app.services.gasto_service import GastoService
    from app.models.gasto import GastoViajeCreate
    gasto_obj = GastoViajeCreate(**data)
    return await GastoService.save_or_update(viaje_id, gasto_obj)

