from fastapi import APIRouter
from app.services.role_service import RoleService

router = APIRouter(prefix="/api/roles", tags=["roles"])

@router.get("/")
async def list_roles():
    """Obtiene todos los roles disponibles."""
    return await RoleService.get_all_roles()
