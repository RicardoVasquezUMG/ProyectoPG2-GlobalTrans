from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from typing import List
from app.models.cargamento import CargamentoCreate, CargamentoUpdate, CargamentoRead, CargamentoReadWithRelations
from app.models.documento import DocumentoRead
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

@router.get("/{cargamento_id}/documentos", response_model=List[DocumentoRead])
async def list_documentos(cargamento_id: str, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Obtiene la lista de documentos de un cargamento."""
    return await CargamentoService.get_documents(cargamento_id)

@router.post("/{cargamento_id}/documentos", response_model=DocumentoRead, status_code=status.HTTP_201_CREATED)
async def upload_documento(
    cargamento_id: str,
    file: UploadFile = File(...),
    tipo: str = Form(...),
    user = Depends(require_roles(UserRole.LEVEL_1))
):
    """Sube un documento PDF a un cargamento."""
    file_bytes = await file.read()
    return await CargamentoService.upload_document(cargamento_id, file_bytes, file.filename, file.content_type, tipo)

@router.delete("/documentos/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_documento(documento_id: str, user = Depends(require_roles(UserRole.LEVEL_1))):
    """Elimina un documento adjunto de un cargamento."""
    await CargamentoService.delete_document(documento_id)
