from app.database import get_supabase_admin
from app.models.cargamento import CargamentoCreate, CargamentoUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class CargamentoService:
    @staticmethod
    async def get_all():
        try:
            # We want to join with furgones to get numero_contenedor and campanias for descripcion
            response = get_supabase_admin().table("cargamentos").select(
                "*, furgones!inner(numero_contenedor), campanias!inner(descripcion)"
            ).order("created_at", desc=True).execute()
            
            # Map the response to flatten the nested relation data for the frontend
            data = response.data
            for row in data:
                furgon = row.pop('furgones', {})
                campania = row.pop('campanias', {})
                row['numero_contenedor'] = furgon.get('numero_contenedor') if furgon else None
                row['descripcion_campania'] = campania.get('descripcion') if campania else None
                
            return data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener cargamentos: {str(e)}")

    @staticmethod
    async def create(data: CargamentoCreate):
        try:
            insert_data = data.model_dump()
            # The estado will default to 'creado' per DB and Model defaults
            # However, pydantic model defaults aren't in model_dump unless explicitly set or if we use exclude_unset=False
            response = get_supabase_admin().table("cargamentos").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear el cargamento")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear cargamento: {str(e)}")

    @staticmethod
    async def update(cargamento_id: str, data: CargamentoUpdate):
        update_data = data.model_dump()
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        if update_data.get("estado") == "conciliado":
            update_data["fecha_cierre"] = datetime.now(timezone.utc).isoformat()
            
        try:
            response = get_supabase_admin().table("cargamentos").update(update_data).eq("id", cargamento_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el cargamento: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Cargamento no encontrado o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(cargamento_id: str):
        try:
            response = get_supabase_admin().table("cargamentos").delete().eq("id", cargamento_id).execute()
            if not response.data:
                raise BadRequestError(detail="Cargamento no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar cargamento: {str(e)}")
