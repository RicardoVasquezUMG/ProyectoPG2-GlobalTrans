from app.database import get_supabase_admin
from app.models.vehicle import VehicleCreate, VehicleUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class VehicleService:
    @staticmethod
    async def get_all():
        try:
            response = get_supabase_admin().table("vehicles").select("*").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener vehículos: {str(e)}")

    @staticmethod
    async def create(data: VehicleCreate):
        try:
            insert_data = data.model_dump()
            response = get_supabase_admin().table("vehicles").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear el vehículo")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear vehículo: {str(e)}")

    @staticmethod
    async def update(vehicle_id: str, data: VehicleUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
        try:
            response = get_supabase_admin().table("vehicles").update(update_data).eq("id", vehicle_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el vehículo: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Vehículo no encontrado o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(vehicle_id: str):
        try:
            response = get_supabase_admin().table("vehicles").delete().eq("id", vehicle_id).execute()
            if not response.data:
                raise BadRequestError(detail="Vehículo no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar vehículo: {str(e)}")
