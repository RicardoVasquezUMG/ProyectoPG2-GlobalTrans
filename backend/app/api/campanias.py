from fastapi import APIRouter, status
from app.models.campania import CampaniaCreate, CampaniaRead, CampaniaUpdate
from app.services.campania_service import CampaniaService

router = APIRouter(prefix="/api/campanias", tags=["campanias"])

@router.get("/", response_model=list[CampaniaRead])
async def list_campanias():
    """Lista todas las campañas."""
    return await CampaniaService.get_all()

@router.post("/", response_model=CampaniaRead, status_code=status.HTTP_201_CREATED)
async def create_campania(data: CampaniaCreate):
    """Crea una nueva campaña."""
    return await CampaniaService.create(data)

@router.put("/{campania_id}", response_model=CampaniaRead)
async def update_campania(campania_id: str, data: CampaniaUpdate):
    """Actualiza los datos de una campaña existente."""
    return await CampaniaService.update(campania_id, data)

@router.delete("/{campania_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campania(campania_id: str):
    """Elimina una campaña."""
    await CampaniaService.delete(campania_id)
