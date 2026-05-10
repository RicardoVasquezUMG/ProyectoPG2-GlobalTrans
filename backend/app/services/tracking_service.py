from app.database import get_supabase_admin
from app.models.tracking import CheckpointCreate, PosicionUpdate
from app.models.viaje import ESTADOS_VIAJE
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone


class TrackingService:
    """Servicio para gestionar el tracking de viajes: checkpoints, posición GPS y estados."""

    @staticmethod
    async def registrar_checkpoint(viaje_id: str, data: CheckpointCreate, user_id: str = None):
        """Registra un nuevo checkpoint y actualiza el estado del viaje."""
        # Validar que el estado sea válido
        if data.estado not in ESTADOS_VIAJE:
            raise BadRequestError(detail=f"Estado inválido. Valores permitidos: {', '.join(ESTADOS_VIAJE)}")

        try:
            sb = get_supabase_admin()

            # Verificar que el viaje existe
            viaje_resp = sb.table("viajes").select("id, estado").eq("id", viaje_id).execute()
            if not viaje_resp.data:
                raise BadRequestError(detail="Viaje no encontrado")

            # Crear el checkpoint
            checkpoint_data = {
                "viaje_id": viaje_id,
                "estado": data.estado,
                "latitud": data.latitud,
                "longitud": data.longitud,
                "ubicacion_nombre": data.ubicacion_nombre,
                "pais": data.pais,
                "notas": data.notas,
                "registrado_por": user_id,
                "fecha_evento": datetime.now(timezone.utc).isoformat()
            }
            checkpoint_resp = sb.table("viaje_checkpoints").insert(checkpoint_data).execute()
            if not checkpoint_resp.data:
                raise BadRequestError(detail="Error al crear el checkpoint")

            # Actualizar el estado del viaje
            sb.table("viajes").update({
                "estado": data.estado,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", viaje_id).execute()

            return checkpoint_resp.data[0]

        except BadRequestError:
            raise
        except Exception as e:
            raise BadRequestError(detail=f"Error al registrar checkpoint: {str(e)}")

    @staticmethod
    async def actualizar_posicion(viaje_id: str, data: PosicionUpdate):
        """Actualiza (upsert) la posición GPS actual de un viaje."""
        try:
            sb = get_supabase_admin()

            # Verificar que el viaje existe y está activo
            viaje_resp = sb.table("viajes").select("id, estado").eq("id", viaje_id).execute()
            if not viaje_resp.data:
                raise BadRequestError(detail="Viaje no encontrado")
            if viaje_resp.data[0]["estado"] not in ("en_ruta", "en_aduana"):
                raise BadRequestError(detail="Solo se puede actualizar la posición de viajes activos (en_ruta o en_aduana)")

            posicion_data = {
                "viaje_id": viaje_id,
                "latitud": data.latitud,
                "longitud": data.longitud,
                "velocidad": data.velocidad,
                "rumbo": data.rumbo,
                "precision_gps": data.precision_gps,
                "fecha_actualizacion": datetime.now(timezone.utc).isoformat()
            }

            # Upsert: insertar o actualizar si ya existe
            resp = sb.table("viaje_posicion_actual").upsert(posicion_data).execute()
            if not resp.data:
                raise BadRequestError(detail="Error al actualizar la posición")

            return resp.data[0]

        except BadRequestError:
            raise
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar posición: {str(e)}")

    @staticmethod
    async def obtener_historial(viaje_id: str):
        """Obtiene todos los checkpoints de un viaje ordenados cronológicamente."""
        try:
            sb = get_supabase_admin()
            resp = sb.table("viaje_checkpoints") \
                .select("*, users!registrado_por(full_name)") \
                .eq("viaje_id", viaje_id) \
                .order("fecha_evento", desc=False) \
                .execute()

            data = resp.data
            for row in data:
                user_info = row.pop("users", {})
                row["nombre_registrador"] = user_info.get("full_name") if user_info else None

            return data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener historial: {str(e)}")

    @staticmethod
    async def obtener_posicion_actual(viaje_id: str):
        """Obtiene la última posición GPS conocida de un viaje."""
        try:
            sb = get_supabase_admin()
            resp = sb.table("viaje_posicion_actual") \
                .select("*") \
                .eq("viaje_id", viaje_id) \
                .execute()

            return resp.data[0] if resp.data else None
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener posición: {str(e)}")

    @staticmethod
    async def obtener_viajes_activos():
        """Obtiene todos los viajes en estado activo (en_ruta, en_aduana) con su posición y datos del piloto."""
        try:
            sb = get_supabase_admin()

            # Obtener viajes activos con joins
            resp = sb.table("viajes") \
                .select("id, estado, fecha_plan_salida, observaciones, users!inner(full_name), vehicles!inner(placas), tiendas!inner(nombre, pais)") \
                .in_("estado", ["en_ruta", "en_aduana"]) \
                .order("fecha_plan_salida", desc=False) \
                .execute()

            viajes = resp.data
            result = []

            for viaje in viajes:
                user_info = viaje.pop("users", {})
                vehicle_info = viaje.pop("vehicles", {})
                tienda_info = viaje.pop("tiendas", {})

                # Obtener posición actual
                pos_resp = sb.table("viaje_posicion_actual") \
                    .select("*") \
                    .eq("viaje_id", viaje["id"]) \
                    .execute()

                pos = pos_resp.data[0] if pos_resp.data else {}

                result.append({
                    "id": viaje["id"],
                    "estado": viaje["estado"],
                    "fecha_plan_salida": viaje["fecha_plan_salida"],
                    "nombre_piloto": user_info.get("full_name"),
                    "placa_vehiculo": vehicle_info.get("placas"),
                    "nombre_tienda": tienda_info.get("nombre"),
                    "pais_destino": tienda_info.get("pais"),
                    "latitud": float(pos.get("latitud", 0)) if pos.get("latitud") else None,
                    "longitud": float(pos.get("longitud", 0)) if pos.get("longitud") else None,
                    "velocidad": float(pos.get("velocidad", 0)) if pos.get("velocidad") else None,
                    "fecha_actualizacion": pos.get("fecha_actualizacion"),
                })

            return result

        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener viajes activos: {str(e)}")

    @staticmethod
    async def obtener_viaje_detalle(viaje_id: str):
        """Obtiene los datos completos de un viaje para la vista de detalle."""
        try:
            sb = get_supabase_admin()

            # Datos del viaje con joins
            resp = sb.table("viajes") \
                .select("*, users!inner(full_name), vehicles!inner(placas), tiendas!inner(nombre, pais, direccion, latitud, longitud), cargamentos!inner(id, furgon_id, furgones(numero_contenedor))") \
                .eq("id", viaje_id) \
                .execute()

            if not resp.data:
                raise BadRequestError(detail="Viaje no encontrado")

            viaje = resp.data[0]
            user_info = viaje.pop("users", {})
            vehicle_info = viaje.pop("vehicles", {})
            tienda_info = viaje.pop("tiendas", {})
            cargamento_info = viaje.pop("cargamentos", {})
            furgon_info = cargamento_info.get("furgones", {}) if cargamento_info else {}

            viaje["nombre_piloto"] = user_info.get("full_name")
            viaje["placa_vehiculo"] = vehicle_info.get("placas")
            viaje["nombre_tienda"] = tienda_info.get("nombre")
            viaje["pais_destino"] = tienda_info.get("pais")
            viaje["direccion_tienda"] = tienda_info.get("direccion")
            viaje["tienda_latitud"] = tienda_info.get("latitud")
            viaje["tienda_longitud"] = tienda_info.get("longitud")
            viaje["numero_contenedor"] = furgon_info.get("numero_contenedor") if furgon_info else None

            return viaje

        except BadRequestError:
            raise
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener detalle del viaje: {str(e)}")
