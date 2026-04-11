from fastapi import APIRouter, status
from app.models.furgon import FurgonCreate, FurgonRead, FurgonUpdate
from app.services.furgon_service import FurgonService

router = APIRouter(prefix="/api/furgones", tags=["furgones"])

@router.get("/", response_model=list[FurgonRead])
async def list_furgones():
    """Lista todos los furgones."""
    return await FurgonService.get_all()

@router.post("/", response_model=FurgonRead, status_code=status.HTTP_201_CREATED)
async def create_furgon(data: FurgonCreate):
    """Crea un nuevo furgón."""
    return await FurgonService.create(data)

@router.put("/{furgon_id}", response_model=FurgonRead)
async def update_furgon(furgon_id: str, data: FurgonUpdate):
    """Actualiza los datos de un furgón existente."""
    return await FurgonService.update(furgon_id, data)

@router.delete("/{furgon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_furgon(furgon_id: str):
    """Elimina un furgón."""
    await FurgonService.delete(furgon_id)
