from app.database import get_supabase_admin
from app.models.campania import CampaniaCreate, CampaniaUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class CampaniaService:
    @staticmethod
    async def get_all():
        try:
            response = get_supabase_admin().table("campanias").select("*").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener campañas: {str(e)}")

    @staticmethod
    async def create(data: CampaniaCreate):
        try:
            insert_data = data.model_dump()
            insert_data["fecha_inicio"] = insert_data["fecha_inicio"].isoformat()
            insert_data["fecha_fin"] = insert_data["fecha_fin"].isoformat()
            response = get_supabase_admin().table("campanias").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear la campaña")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear campaña: {str(e)}")

    @staticmethod
    async def update(campania_id: str, data: CampaniaUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return None
            
        if "fecha_inicio" in update_data:
            update_data["fecha_inicio"] = update_data["fecha_inicio"].isoformat()
        if "fecha_fin" in update_data:
            update_data["fecha_fin"] = update_data["fecha_fin"].isoformat()
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
        try:
            response = get_supabase_admin().table("campanias").update(update_data).eq("id", campania_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar la campaña: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Campaña no encontrada o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(campania_id: str):
        try:
            response = get_supabase_admin().table("campanias").delete().eq("id", campania_id).execute()
            if not response.data:
                raise BadRequestError(detail="Campaña no encontrada")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar campaña: {str(e)}")
