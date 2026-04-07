from fastapi import APIRouter
from app.models.user import UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    """Actualiza los datos de un usuario existente."""
    return await UserService.update(user_id, data)
