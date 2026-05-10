from app.database import get_supabase_admin
from app.models.aduana import AduanaCreate, AduanaUpdate
from app.utils.exceptions import BadRequestError, NotFoundError

class AduanaService:
    @staticmethod
    async def get_all(active_only: bool = True):
        try:
            query = get_supabase_admin().table("aduanas").select("*")
            if active_only:
                query = query.eq("is_active", True)
            
            response = query.order("nombre").execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener aduanas: {str(e)}")

    @staticmethod
    async def get_by_id(aduana_id: str):
        try:
            response = get_supabase_admin().table("aduanas").select("*").eq("id", aduana_id).execute()
            if not response.data:
                raise NotFoundError(detail="Aduana no encontrada")
            return response.data[0]
        except NotFoundError:
            raise
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener la aduana: {str(e)}")

    @staticmethod
    async def create(data: AduanaCreate):
        try:
            response = get_supabase_admin().table("aduanas").insert(data.model_dump()).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear la aduana")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear aduana: {str(e)}")

    @staticmethod
    async def update(aduana_id: str, data: AduanaUpdate):
        try:
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return await AduanaService.get_by_id(aduana_id)

            response = get_supabase_admin().table("aduanas").update(update_data).eq("id", aduana_id).execute()
            if not response.data:
                raise NotFoundError(detail="Aduana no encontrada o no se pudo actualizar")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar aduana: {str(e)}")

    @staticmethod
    async def delete(aduana_id: str):
        try:
            # Borrado lógico
            response = get_supabase_admin().table("aduanas").update({"is_active": False}).eq("id", aduana_id).execute()
            if not response.data:
                raise NotFoundError(detail="Aduana no encontrada")
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar aduana: {str(e)}")
