from app.database import get_supabase_admin
from app.models.viaje import ViajeCreate, ViajeUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class ViajeService:
    @staticmethod
    async def get_all():
        try:
            # We join with cargamentos, vehicles, tiendas, and users to get descriptive fields
            response = get_supabase_admin().table("viajes").select(
                "*, cargamentos!inner(furgon_id, furgones(numero_contenedor)), vehicles!inner(placas), tiendas!inner(nombre), users!inner(full_name)"
            ).order("created_at", desc=True).execute()
            
            data = response.data
            for row in data:
                # Extract related data and flatten it
                cargamento = row.pop("cargamentos", {})
                furgon = cargamento.get("furgones", {}) if cargamento else {}
                vehiculo = row.pop("vehicles", {})
                tienda = row.pop("tiendas", {})
                usuario = row.pop("users", {})
                
                row["numero_contenedor"] = furgon.get("numero_contenedor") if furgon else None
                row["placa_vehiculo"] = vehiculo.get("placas") if vehiculo else None
                row["nombre_tienda"] = tienda.get("nombre") if tienda else None
                row["nombre_piloto"] = usuario.get("full_name") if usuario else None
                
            return data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener viajes: {str(e)}")

    @staticmethod
    async def create(data: ViajeCreate):
        try:
            insert_data = data.model_dump()
            # Serialize datetime to isoformat
            if insert_data.get("fecha_plan_salida"):
                insert_data["fecha_plan_salida"] = insert_data["fecha_plan_salida"].isoformat()
            
            response = get_supabase_admin().table("viajes").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear el viaje")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear viaje: {str(e)}")

    @staticmethod
    async def update(viaje_id: str, data: ViajeUpdate):
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        if update_data.get("fecha_plan_salida"):
            update_data["fecha_plan_salida"] = update_data["fecha_plan_salida"].isoformat()
            
        try:
            response = get_supabase_admin().table("viajes").update(update_data).eq("id", viaje_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el viaje: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Viaje no encontrado o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(viaje_id: str):
        try:
            response = get_supabase_admin().table("viajes").delete().eq("id", viaje_id).execute()
            if not response.data:
                raise BadRequestError(detail="Viaje no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar viaje: {str(e)}")
