from app.database import get_supabase_admin
from app.models.user import UserUpdate
from app.utils.exceptions import BadRequestError

class UserService:
    @staticmethod
    async def get_all():
        try:
            response = get_supabase_admin().table("users").select("*, roles(name, description)").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener usuarios: {str(e)}")

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

    @staticmethod
    async def delete(user_id: str):
        try:
            # Borrado lógico: marcar is_active = False
            response = get_supabase_admin().table("users").update({"is_active": False}).eq("id", user_id).execute()
            if not response.data:
                raise BadRequestError(detail="Usuario no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar usuario: {str(e)}")
