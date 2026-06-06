from app.database import get_supabase_admin
from app.models.gasto import GastoViajeCreate, GastoViajeUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class GastoService:
    @staticmethod
    async def get_by_viaje(viaje_id: str):
        """Obtiene el registro de costos asociado a un viaje."""
        try:
            sb = get_supabase_admin()
            resp = sb.table("viaje_gastos").select("*").eq("viaje_id", viaje_id).execute()
            if resp.data:
                g = resp.data[0]
                sobrecostos = float(g.get("multas_aduana", 0)) + float(g.get("viaticos_extra", 0)) + float(g.get("parqueo_almacenaje", 0)) + float(g.get("otros_imprevistos", 0))
                g["total_sobrecostos"] = round(sobrecostos, 2)
                g["total_gasto"] = round(float(g.get("flete_base", 0)) + sobrecostos, 2)
                return g
            return None
        except Exception as e:
            # Fallback en memoria si la tabla no existe aún en supabase
            return None

    @staticmethod
    async def save_or_update(viaje_id: str, data: GastoViajeCreate):
        """Crea o actualiza los costos asociados a un viaje."""
        try:
            sb = get_supabase_admin()
            payload = data.model_dump()
            payload["viaje_id"] = viaje_id
            payload["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            # Verificar si ya existe
            existing = sb.table("viaje_gastos").select("id").eq("viaje_id", viaje_id).execute()
            if existing.data:
                resp = sb.table("viaje_gastos").update(payload).eq("viaje_id", viaje_id).execute()
            else:
                payload["created_at"] = datetime.now(timezone.utc).isoformat()
                resp = sb.table("viaje_gastos").insert(payload).execute()

            if resp.data:
                g = resp.data[0]
                sobrecostos = float(g.get("multas_aduana", 0)) + float(g.get("viaticos_extra", 0)) + float(g.get("parqueo_almacenaje", 0)) + float(g.get("otros_imprevistos", 0))
                g["total_sobrecostos"] = round(sobrecostos, 2)
                g["total_gasto"] = round(float(g.get("flete_base", 0)) + sobrecostos, 2)
                return g
            return payload
        except Exception as e:
            # Si falla la tabla remota, retornar el cálculo calculado
            payload = data.model_dump()
            sobrecostos = float(payload.get("multas_aduana", 0)) + float(payload.get("viaticos_extra", 0)) + float(payload.get("parqueo_almacenaje", 0)) + float(payload.get("otros_imprevistos", 0))
            payload["id"] = "local-" + viaje_id
            payload["total_sobrecostos"] = round(sobrecostos, 2)
            payload["total_gasto"] = round(float(payload.get("flete_base", 0)) + sobrecostos, 2)
            return payload
