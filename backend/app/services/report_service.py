from app.database import get_supabase_admin
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone

class ReportService:
    @staticmethod
    async def get_dashboard_kpis():
        """Obtiene los KPIs principales para el Dashboard."""
        try:
            sb = get_supabase_admin()
            
            # Obtener todos los viajes para calcular KPIs
            resp = sb.table("viajes").select("estado, fecha_esperada_llegada, fecha_llegada_real, fecha_plan_salida").execute()
            viajes = resp.data
            
            activos = 0
            entregados = 0
            retrasados = 0
            
            total_transit_hours = 0
            delivered_count = 0
            
            now = datetime.now(timezone.utc)
            
            for v in viajes:
                estado = v["estado"]
                
                # Clasificar activos
                if estado in ["en_ruta", "en_aduana"]:
                    # Verificar si está retrasado
                    if v.get("fecha_esperada_llegada"):
                        eta = datetime.fromisoformat(v["fecha_esperada_llegada"].replace('Z', '+00:00'))
                        if now > eta:
                            retrasados += 1
                        else:
                            activos += 1
                    else:
                        activos += 1
                
                # Clasificar entregados
                elif estado == "entregado":
                    entregados += 1
                    
                    # Calcular tiempo de tránsito
                    if v.get("fecha_plan_salida") and v.get("fecha_llegada_real"):
                        try:
                            s = datetime.fromisoformat(v["fecha_plan_salida"].replace('Z', '+00:00'))
                            e = datetime.fromisoformat(v["fecha_llegada_real"].replace('Z', '+00:00'))
                            if e > s:
                                total_transit_hours += (e - s).total_seconds() / 3600.0
                                delivered_count += 1
                        except:
                            pass
                
                # Clasificar retrasados marcados explícitamente
                elif estado == "retrasado":
                    retrasados += 1
                    
            avg_transit_time = round(total_transit_hours / delivered_count, 1) if delivered_count > 0 else 0
            
            return {
                "activos": activos,
                "entregados": entregados,
                "retrasados": retrasados,
                "tiempo_promedio_horas": avg_transit_time
            }
            
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener KPIs: {str(e)}")

    @staticmethod
    async def get_auditoria():
        """Obtiene datos de éxito de entregas e historial de incidentes."""
        try:
            sb = get_supabase_admin()
            
            # Obtener viajes
            resp = sb.table("viajes").select("estado, fecha_esperada_llegada, fecha_llegada_real").execute()
            viajes = resp.data
            
            total_entregados = len([v for v in viajes if v["estado"] == "entregado"])
            total_finalizados = len([v for v in viajes if v["estado"] in ["entregado", "cancelado"]])
            
            # Entregas a tiempo
            entregas_a_tiempo = 0
            for v in viajes:
                if v["estado"] == "entregado" and v.get("fecha_esperada_llegada") and v.get("fecha_llegada_real"):
                    try:
                        eta = datetime.fromisoformat(v["fecha_esperada_llegada"].replace('Z', '+00:00'))
                        real = datetime.fromisoformat(v["fecha_llegada_real"].replace('Z', '+00:00'))
                        if real <= eta:
                            entregas_a_tiempo += 1
                    except:
                        pass
                        
            porcentaje_exito = round((entregas_a_tiempo / total_entregados * 100), 1) if total_entregados > 0 else 0
            
            # Incidentes
            resp_inc = sb.table("viaje_checkpoints")\
                .select("estado, notas, fecha_evento, viajes(id), ubicacion_nombre")\
                .eq("estado", "retrasado")\
                .order("fecha_evento", desc=True)\
                .limit(10)\
                .execute()
                
            incidentes = []
            for inc in resp_inc.data:
                incidentes.append({
                    "viaje_id": inc.get("viajes", {}).get("id") if inc.get("viajes") else None,
                    "notas": inc["notas"],
                    "ubicacion": inc["ubicacion_nombre"],
                    "fecha": inc["fecha_evento"]
                })
                
            return {
                "porcentaje_exito_tiempo": porcentaje_exito,
                "total_entregados": total_entregados,
                "incidentes_recientes": incidentes
            }
            
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener auditoría: {str(e)}")

    @staticmethod
    async def get_inteligencia_rutas():
        """Obtiene los promedios de tiempo por aduana usando la vista SQL."""
        try:
            sb = get_supabase_admin()
            
            resp = sb.table("vw_tiempos_aduana").select("*").execute()
            datos = resp.data
            
            aduanas = {}
            for row in datos:
                nombre = row["nombre_aduana"]
                horas = float(row["horas_en_aduana"])
                
                if nombre not in aduanas:
                    aduanas[nombre] = {"total_horas": 0, "conteo": 0}
                
                aduanas[nombre]["total_horas"] += horas
                aduanas[nombre]["conteo"] += 1
                
            resultado = []
            for nombre, stats in aduanas.items():
                resultado.append({
                    "aduana": nombre,
                    "tiempo_promedio_horas": round(stats["total_horas"] / stats["conteo"], 2),
                    "cruces_registrados": stats["conteo"]
                })
                
            # Ordenar por tiempo promedio desc (las peores primero)
            resultado.sort(key=lambda x: x["tiempo_promedio_horas"], reverse=True)
            
            return resultado
            
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener inteligencia de rutas: {str(e)}")
