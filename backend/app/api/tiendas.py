from fastapi import APIRouter, Depends, status
from app.models.tienda import TiendaCreate, TiendaRead, TiendaUpdate
from app.services.tienda_service import TiendaService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/tiendas", tags=["tiendas"])

@router.get("/", response_model=list[TiendaRead])
async def list_tiendas(user=Depends(require_roles(UserRole.LEVEL_1))):
    """Obtiene la lista de todas las tiendas."""
    return await TiendaService.get_all()

@router.get("/{tienda_id}", response_model=TiendaRead)
async def get_tienda(tienda_id: str, user=Depends(require_roles(UserRole.LEVEL_1))):
    """Obtiene una tienda específica."""
    return await TiendaService.get_by_id(tienda_id)

@router.post("/", response_model=TiendaRead, status_code=status.HTTP_201_CREATED)
async def create_tienda(data: TiendaCreate, user=Depends(require_roles(UserRole.LEVEL_1))):
    """Crea una nueva tienda."""
    return await TiendaService.create(data)

@router.put("/{tienda_id}", response_model=TiendaRead)
async def update_tienda(tienda_id: str, data: TiendaUpdate, user=Depends(require_roles(UserRole.LEVEL_1))):
    """Actualiza una tienda existente."""
    return await TiendaService.update(tienda_id, data)

@router.delete("/{tienda_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tienda(tienda_id: str, user=Depends(require_roles(UserRole.LEVEL_1))):
    """Elimina una tienda."""
    await TiendaService.delete(tienda_id)
