from app.database import get_supabase_admin
from app.models.furgon import FurgonCreate, FurgonUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class FurgonService:
    @staticmethod
    async def get_all():
        try:
            response = get_supabase_admin().table("furgones").select("*").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener furgones: {str(e)}")

    @staticmethod
    async def create(data: FurgonCreate):
        try:
            insert_data = data.model_dump()
            response = get_supabase_admin().table("furgones").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear el furgón")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear furgón: {str(e)}")

    @staticmethod
    async def update(furgon_id: str, data: FurgonUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
        try:
            response = get_supabase_admin().table("furgones").update(update_data).eq("id", furgon_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el furgón: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Furgón no encontrado o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(furgon_id: str):
        try:
            response = get_supabase_admin().table("furgones").delete().eq("id", furgon_id).execute()
            if not response.data:
                raise BadRequestError(detail="Furgón no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar furgón: {str(e)}")
