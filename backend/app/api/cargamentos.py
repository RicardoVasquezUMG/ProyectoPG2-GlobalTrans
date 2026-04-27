from fastapi import APIRouter, Depends, status
from typing import List
from app.models.cargamento import CargamentoCreate, CargamentoUpdate, CargamentoRead, CargamentoReadWithRelations
from app.services.cargamento_service import CargamentoService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/cargamentos", tags=["cargamentos"])

@router.get("/", response_model=List[CargamentoReadWithRelations])
async def list_cargamentos(user = Depends(require_roles(UserRole.LEVEL_1))):
    """Obtiene la lista de todos los cargamentos."""
    return await CargamentoService.get_all()

@router.post("/", response_model=CargamentoRead, status_code=status.HTTP_201_CREATED)
async def create_cargamento(data: CargamentoCreate, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Crea un nuevo cargamento."""
    return await CargamentoService.create(data)

@router.patch("/{cargamento_id}", response_model=CargamentoRead)
async def update_cargamento(cargamento_id: str, data: CargamentoUpdate, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Actualiza el estado de un cargamento existente."""
    return await CargamentoService.update(cargamento_id, data)

@router.delete("/{cargamento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cargamento(cargamento_id: str, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Elimina un cargamento."""
    await CargamentoService.delete(cargamento_id)
