from fastapi import APIRouter, Depends, status
from app.models.aduana import AduanaCreate, AduanaRead, AduanaUpdate
from app.services.aduana_service import AduanaService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/aduanas", tags=["aduanas"])

@router.get("/", response_model=list[AduanaRead])
async def list_aduanas(
    active_only: bool = True,
    # Cualquier usuario puede ver aduanas para los selects
    user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))
):
    """Lista las aduanas."""
    return await AduanaService.get_all(active_only)

@router.post("/", response_model=AduanaRead, status_code=status.HTTP_201_CREATED)
async def create_aduana(
    data: AduanaCreate, 
    user = Depends(require_roles(UserRole.LEVEL_1))
):
    """Crea una nueva aduana. Solo administradores."""
    return await AduanaService.create(data)

@router.put("/{aduana_id}", response_model=AduanaRead)
async def update_aduana(
    aduana_id: str, 
    data: AduanaUpdate, 
    user = Depends(require_roles(UserRole.LEVEL_1))
):
    """Actualiza una aduana."""
    return await AduanaService.update(aduana_id, data)

@router.delete("/{aduana_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_aduana(
    aduana_id: str, 
    user = Depends(require_roles(UserRole.LEVEL_1))
):
    """Realiza un borrado lógico de la aduana."""
    await AduanaService.delete(aduana_id)
