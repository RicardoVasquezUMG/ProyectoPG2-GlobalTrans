from app.database import get_supabase_admin
from app.utils.exceptions import BadRequestError

class RoleService:
    @staticmethod
    async def get_all_roles():
        try:
            response = get_supabase_admin().table("roles").select("*").execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener roles: {str(e)}")
