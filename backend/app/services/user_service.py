from app.database import get_supabase_admin
from app.models.user import UserUpdate
from app.utils.exceptions import BadRequestError

class UserService:
    @staticmethod
    async def update(user_id: str, data: UserUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return None
            
        try:
            response = get_supabase_admin().table("users").update(update_data).eq("id", user_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el perfil: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Usuario no encontrado o error en DB")
            
        return response.data[0]
