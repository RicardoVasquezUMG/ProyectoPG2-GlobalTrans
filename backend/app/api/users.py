from fastapi import APIRouter
from app.models.user import UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def list_users():
    """Lista todos los usuarios (requiere permisos de administrador)."""
    return await UserService.get_all()

@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    """Actualiza los datos de un usuario existente."""
    return await UserService.update(user_id, data)

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Realiza un borrado lógico de un usuario (desactiva)."""
    return await UserService.delete(user_id)
