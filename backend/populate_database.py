"""
Script para poblar y enriquecer la base de datos de Supabase con datos historicos
y operativos realistas para las 4 funcionalidades clave de GlobalTrans:
1. Prediccion de tiempos en aduanas y estacionalidad de catalogos.
2. Auditoria digital de entregas y SLAs.
3. Registro de gastos por costos a viaje y sobrecostos imprevistos.
4. Dashboard financiero de rentabilidad por ruta internacional.
"""
import asyncio
from datetime import datetime, timedelta, timezone
from app.database import get_supabase_admin

async def main():
    sb = get_supabase_admin()
    print("Iniciando poblado de base de datos...")

    # 1. Obtener entidades base
    users = sb.table("users").select("id, full_name, email").execute().data
    vehicles = sb.table("vehicles").select("id, placas").execute().data
    tiendas = sb.table("tiendas").select("id, nombre, pais").execute().data
    cargamentos = sb.table("cargamentos").select("id").execute().data
    aduanas = sb.table("aduanas").select("id, nombre, pais_origen, pais_destino, latitud, longitud").execute().data

    if not users or not vehicles or not tiendas or not cargamentos:
        print("Faltan entidades maestras. Asegúrate de tener usuarios, vehículos, tiendas y cargamentos.")
        return

    print(f"Entidades maestras cargadas: {len(users)} usuarios, {len(vehicles)} vehiculos, {len(tiendas)} tiendas, {len(cargamentos)} cargamentos, {len(aduanas)} aduanas.")

    # Mapeo de tiendas por país
    tiendas_por_pais = {}
    for t in tiendas:
        pais = t["pais"]
        if pais not in tiendas_por_pais:
            tiendas_por_pais[pais] = []
        tiendas_por_pais[pais].append(t)

    # Aduanas mapeo por nombre
    aduanas_map = {a["nombre"]: a for a in aduanas}

    # Definir escenarios de viajes realistas a lo largo del año
    # Incluyendo:
    # - Temporadas altas de catálogo (Mayo: Día de la Madre; Octubre-Diciembre: Campaña Catálogos Fin de Año / Black Friday)
    # - Temporadas regulares (Enero, Febrero, Marzo, Junio, Julio, Agosto, Septiembre)
    viajes_escenarios = [
        # --- RUTA 1: Guatemala -> El Salvador (Aduana Pedro de Alvarado / San Cristobal / Valle Nuevo) ---
        {
            "pais": "El Salvador",
            "aduana": "Pedro de Alvarado",
            "mes": 10, "dia": 5, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 9.2,
            "lead_time_horas": 16.5,
            "estado": "entregado",
            "flete_base": 750.0,
            "multas_aduana": 220.0,
            "viaticos_extra": 140.0,
            "parqueo_almacenaje": 95.0,
            "otros_imprevistos": 25.0,
            "incidente": "Retraso de 6 hrs por cola aduanera de 4 km y multa por rectificación DUCA-F",
            "a_tiempo": False,
            "observaciones": "Envío Catálogo Campaña Octubre - Tienda El Salvador San Salvador"
        },
        {
            "pais": "El Salvador",
            "aduana": "San Cristóbal",
            "mes": 10, "dia": 8, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 5.4,
            "lead_time_horas": 13.0,
            "estado": "entregado",
            "flete_base": 780.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 40.0,
            "parqueo_almacenaje": 30.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Ruta alterna optimizada por San Cristóbal - Evitó congestión de Pedro de Alvarado"
        },
        {
            "pais": "El Salvador",
            "aduana": "Pedro de Alvarado",
            "mes": 5, "dia": 7, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 8.8,
            "lead_time_horas": 15.8,
            "estado": "entregado",
            "flete_base": 750.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 110.0,
            "parqueo_almacenaje": 85.0,
            "otros_imprevistos": 0.0,
            "incidente": "Congestión por temporada alta Día de la Madre",
            "a_tiempo": True,
            "observaciones": "Mercadería de cosméticos y perfumería por catálogo de mayo"
        },
        {
            "pais": "El Salvador",
            "aduana": "Valle Nuevo (Las Chinamas)",
            "mes": 8, "dia": 14, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 3.2,
            "lead_time_horas": 11.5,
            "estado": "entregado",
            "flete_base": 720.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 20.0,
            "parqueo_almacenaje": 25.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Operación regular mensual agendada sin incidencias"
        },
        {
            "pais": "El Salvador",
            "aduana": "Pedro de Alvarado",
            "mes": 9, "dia": 22, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 4.1,
            "lead_time_horas": 12.8,
            "estado": "entregado",
            "flete_base": 740.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 30.0,
            "parqueo_almacenaje": 35.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Entrega completada dentro de ventana óptima"
        },

        # --- RUTA 2: Guatemala -> Honduras (Aduana Agua Caliente / El Florido / Corinto) ---
        {
            "pais": "Honduras",
            "aduana": "El Florido",
            "mes": 10, "dia": 3, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 10.5,
            "lead_time_horas": 30.0,
            "estado": "entregado",
            "flete_base": 1100.0,
            "multas_aduana": 180.0,
            "viaticos_extra": 190.0,
            "parqueo_almacenaje": 110.0,
            "otros_imprevistos": 40.0,
            "incidente": "Retraso severo por congestión en El Florido y multa por discrepancia de pesaje",
            "a_tiempo": False,
            "observaciones": "Cargamento Catálogo Textil Navidad San Pedro Sula"
        },
        {
            "pais": "Honduras",
            "aduana": "Agua Caliente",
            "mes": 10, "dia": 10, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 6.8,
            "lead_time_horas": 24.5,
            "estado": "entregado",
            "flete_base": 1150.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 85.0,
            "parqueo_almacenaje": 50.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Ruta eficiente por Agua Caliente con bypass de cola"
        },
        {
            "pais": "Honduras",
            "aduana": "Corinto",
            "mes": 6, "dia": 18, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 4.5,
            "lead_time_horas": 22.0,
            "estado": "entregado",
            "flete_base": 1080.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 35.0,
            "parqueo_almacenaje": 30.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Ruta norte puerto Cortés sin contratiempos"
        },
        {
            "pais": "Honduras",
            "aduana": "Agua Caliente",
            "mes": 8, "dia": 29, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 5.0,
            "lead_time_horas": 23.0,
            "estado": "entregado",
            "flete_base": 1120.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 40.0,
            "parqueo_almacenaje": 40.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Llegada regular dentro del SLA contractual"
        },

        # --- RUTA 3: Guatemala -> Nicaragua (Aduana Guasaule / El Espino) ---
        {
            "pais": "Nicaragua",
            "aduana": "Guasaule",
            "mes": 10, "dia": 2, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 12.5,
            "lead_time_horas": 54.0,
            "estado": "entregado",
            "flete_base": 1600.0,
            "multas_aduana": 310.0,
            "viaticos_extra": 280.0,
            "parqueo_almacenaje": 160.0,
            "otros_imprevistos": 50.0,
            "incidente": "Retraso migratorio y aduanero en frontera Guasaule; multa por vencimiento de tránsito",
            "a_tiempo": False,
            "observaciones": "Cargamento catálogos Managua - Temporada alta"
        },
        {
            "pais": "Nicaragua",
            "aduana": "El Espino",
            "mes": 7, "dia": 12, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 7.0,
            "lead_time_horas": 45.0,
            "estado": "entregado",
            "flete_base": 1580.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 90.0,
            "parqueo_almacenaje": 60.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Tránsito fluido por El Espino"
        },
        {
            "pais": "Nicaragua",
            "aduana": "Guasaule",
            "mes": 5, "dia": 15, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 11.0,
            "lead_time_horas": 51.0,
            "estado": "entregado",
            "flete_base": 1620.0,
            "multas_aduana": 150.0,
            "viaticos_extra": 220.0,
            "parqueo_almacenaje": 130.0,
            "otros_imprevistos": 20.0,
            "incidente": "Pernocta forzada por cierre nocturno de ventanilla fiscal aduanera",
            "a_tiempo": False,
            "observaciones": "Campaña Día de las Madres Nicaragua"
        },

        # --- RUTA 4: Guatemala -> Costa Rica (Aduana Peñas Blancas) ---
        {
            "pais": "Costa Rica",
            "aduana": "Peñas Blancas",
            "mes": 10, "dia": 6, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 14.0,
            "lead_time_horas": 82.0,
            "estado": "entregado",
            "flete_base": 2100.0,
            "multas_aduana": 290.0,
            "viaticos_extra": 360.0,
            "parqueo_almacenaje": 210.0,
            "otros_imprevistos": 60.0,
            "incidente": "Fila de 8 km en Peñas Blancas y retraso de inspección fitozoosanitaria",
            "a_tiempo": False,
            "observaciones": "Distribución San José Costa Rica - Productos Catálogo Hogar"
        },
        {
            "pais": "Costa Rica",
            "aduana": "Peñas Blancas",
            "mes": 8, "dia": 5, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 8.5,
            "lead_time_horas": 70.0,
            "estado": "entregado",
            "flete_base": 2050.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 140.0,
            "parqueo_almacenaje": 80.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Cruce dentro de parámetros estándar para temporada baja"
        },

        # --- RUTA 5: Guatemala -> Panamá (Aduana Paso Canoas) ---
        {
            "pais": "Panamá",
            "aduana": "Paso Canoas",
            "mes": 10, "dia": 4, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 11.5,
            "lead_time_horas": 106.0,
            "estado": "entregado",
            "flete_base": 2750.0,
            "multas_aduana": 380.0,
            "viaticos_extra": 420.0,
            "parqueo_almacenaje": 240.0,
            "otros_imprevistos": 80.0,
            "incidente": "Multa por discrepancia de sello fiscal en Paso Canoas y 36h de retención",
            "a_tiempo": False,
            "observaciones": "Corredor Internacional Ciudad de Panamá - Carga masiva Fin de Año"
        },
        {
            "pais": "Panamá",
            "aduana": "Paso Canoas",
            "mes": 7, "dia": 20, "anio": 2026,
            "es_alta": False,
            "horas_espera_aduana": 6.5,
            "lead_time_horas": 94.0,
            "estado": "entregado",
            "flete_base": 2700.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 190.0,
            "parqueo_almacenaje": 90.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "Entrega exitosa Zona Libre de Colón / Panamá City"
        },

        # --- VIAJES EN CURSO O ACTIVOS (Octubre 2026 para monitoreo en vivo) ---
        {
            "pais": "El Salvador",
            "aduana": "Pedro de Alvarado",
            "mes": 10, "dia": 9, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 8.0,
            "lead_time_horas": 15.0,
            "estado": "en_aduana",
            "flete_base": 760.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 80.0,
            "parqueo_almacenaje": 60.0,
            "otros_imprevistos": 0.0,
            "incidente": "En trámite aduanero actualmente (cola de 3 horas)",
            "a_tiempo": True,
            "observaciones": "Viaje activo en revisión aduanera - Catálogo Navidad"
        },
        {
            "pais": "Honduras",
            "aduana": "Agua Caliente",
            "mes": 10, "dia": 10, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 5.5,
            "lead_time_horas": 24.0,
            "estado": "en_ruta",
            "flete_base": 1150.0,
            "multas_aduana": 0.0,
            "viaticos_extra": 50.0,
            "parqueo_almacenaje": 0.0,
            "otros_imprevistos": 0.0,
            "incidente": None,
            "a_tiempo": True,
            "observaciones": "En tránsito hacia Tegucigalpa"
        },
        {
            "pais": "Costa Rica",
            "aduana": "Peñas Blancas",
            "mes": 10, "dia": 8, "anio": 2026,
            "es_alta": True,
            "horas_espera_aduana": 12.0,
            "lead_time_horas": 75.0,
            "estado": "retrasado",
            "flete_base": 2100.0,
            "multas_aduana": 250.0,
            "viaticos_extra": 320.0,
            "parqueo_almacenaje": 180.0,
            "otros_imprevistos": 45.0,
            "incidente": "Retraso crítico por fallo de sistema aduanero TICA en frontera",
            "a_tiempo": False,
            "observaciones": "Alerta gerencial activada por demora en frontera"
        }
    ]

    # Asignar vehículos y pilotos de manera cíclica
    v_idx = 0
    u_idx = 0
    c_idx = 0

    # Primero: verificar viajes existentes en la base de datos para asociarles gastos
    existing_viajes = sb.table("viajes").select("id, tienda_id, estado").execute().data
    print(f"Viajes existentes en DB: {len(existing_viajes)}")

    # Poblar gastos para los viajes existentes si no los tienen
    for ev in existing_viajes:
        v_id = ev["id"]
        # Chequear si ya tiene gastos
        g_check = sb.table("viaje_gastos").select("id").eq("viaje_id", v_id).execute().data
        if not g_check:
            # Asignar gastos coherentes según el estado
            is_delayed = ev["estado"] == "retrasado"
            flete = 1200.0
            multas = 250.0 if is_delayed else 0.0
            viaticos = 180.0 if is_delayed else 60.0
            parqueo = 120.0 if is_delayed else 40.0
            imprevistos = 50.0 if is_delayed else 0.0

            sb.table("viaje_gastos").insert({
                "viaje_id": v_id,
                "flete_base": flete,
                "multas_aduana": multas,
                "viaticos_extra": viaticos,
                "parqueo_almacenaje": parqueo,
                "otros_imprevistos": imprevistos,
                "notas": "Gastos operativos y contingencias logísticas asignadas por sistema"
            }).execute()
            print(f"  + Gastos insertados para viaje existente {v_id}")

    # Ahora crear los nuevos viajes enriquecidos con su historial completo
    print("Creando viajes históricos de corredores internacionales...")
    for esc in viajes_escenarios:
        pais = esc["pais"]
        tiendas_pais = tiendas_por_pais.get(pais, tiendas)
        tienda = tiendas_pais[0] if tiendas_pais else tiendas[0]
        vehiculo = vehicles[v_idx % len(vehicles)]
        usuario = users[u_idx % len(users)]
        cargamento = cargamentos[c_idx % len(cargamentos)]
        v_idx += 1
        u_idx += 1
        c_idx += 1

        # Construir fechas
        salida_dt = datetime(esc["anio"], esc["mes"], esc["dia"], 6, 0, 0, tzinfo=timezone.utc)
        eta_dt = salida_dt + timedelta(hours=esc["lead_time_horas"])
        
        real_dt = None
        if esc["estado"] == "entregado":
            if esc["a_tiempo"]:
                real_dt = eta_dt - timedelta(hours=1.5)
            else:
                real_dt = eta_dt + timedelta(hours=6.0)

        # 1. Insertar viaje
        viaje_payload = {
            "fecha_plan_salida": salida_dt.isoformat(),
            "fecha_esperada_llegada": eta_dt.isoformat(),
            "fecha_llegada_real": real_dt.isoformat() if real_dt else None,
            "estado": esc["estado"],
            "observaciones": esc["observaciones"],
            "cargamento_id": cargamento["id"],
            "vehiculo_id": vehiculo["id"],
            "tienda_id": tienda["id"],
            "usuario_id": usuario["id"]
        }

        v_res = sb.table("viajes").insert(viaje_payload).execute()
        if not v_res.data:
            print("Error al insertar viaje:", esc["observaciones"])
            continue

        viaje_id = v_res.data[0]["id"]
        print(f"Viaje creado: {viaje_id} ({esc['pais']} - {esc['aduana']})")

        # 2. Insertar gastos del viaje
        sb.table("viaje_gastos").insert({
            "viaje_id": viaje_id,
            "flete_base": esc["flete_base"],
            "multas_aduana": esc["multas_aduana"],
            "viaticos_extra": esc["viaticos_extra"],
            "parqueo_almacenaje": esc["parqueo_almacenaje"],
            "otros_imprevistos": esc["otros_imprevistos"],
            "notas": f"Liquidación operativa corredor GT -> {esc['pais']} ({esc['aduana']}). " + (esc["incidente"] or "Sin anomalías.")
        }).execute()

        # 3. Insertar checkpoints para alimentar la vista de auditoría y tiempos de aduana
        ad_info = aduanas_map.get(esc["aduana"], {
            "nombre": esc["aduana"],
            "latitud": 14.191599,
            "longitud": -89.664426
        })

        # Checkpoint 1: Salida
        sb.table("viaje_checkpoints").insert({
            "viaje_id": viaje_id,
            "estado": "en_ruta",
            "ubicacion_nombre": "Hub Central GlobalTrans Guatemala",
            "pais": "Guatemala",
            "latitud": 14.634915,
            "longitud": -90.506882,
            "notas": "Inicio de viaje y despacho de mercancía en bodega central",
            "fecha_evento": salida_dt.isoformat()
        }).execute()

        # Checkpoint 2: Llegada a Aduana (CLAVE para vw_tiempos_aduana)
        llegada_aduana_dt = salida_dt + timedelta(hours=3.5)
        sb.table("viaje_checkpoints").insert({
            "viaje_id": viaje_id,
            "estado": "en_aduana",
            "ubicacion_nombre": ad_info["nombre"],
            "pais": "Frontera",
            "latitud": float(ad_info.get("latitud") or 14.0),
            "longitud": float(ad_info.get("longitud") or -89.5),
            "notas": f"EVENTO: Llegada a Aduana | Presentación de Manifiesto DUCA en {ad_info['nombre']}",
            "fecha_evento": llegada_aduana_dt.isoformat()
        }).execute()

        # Checkpoint 3: Salida de Aduana (CLAVE para vw_tiempos_aduana)
        if esc["estado"] in ["entregado", "en_ruta", "retrasado"]:
            salida_aduana_dt = llegada_aduana_dt + timedelta(hours=esc["horas_espera_aduana"])
            sb.table("viaje_checkpoints").insert({
                "viaje_id": viaje_id,
                "estado": "en_ruta",
                "ubicacion_nombre": ad_info["nombre"],
                "pais": "Frontera",
                "latitud": float(ad_info.get("latitud") or 14.0),
                "longitud": float(ad_info.get("longitud") or -89.5),
                "notas": f"EVENTO: Salida de Aduana | Despacho fiscal concedido tras {esc['horas_espera_aduana']} hrs",
                "fecha_evento": salida_aduana_dt.isoformat()
            }).execute()

        # Checkpoint 4: Incidente (si hubo)
        if esc["incidente"]:
            inc_dt = llegada_aduana_dt + timedelta(hours=1.0)
            sb.table("viaje_checkpoints").insert({
                "viaje_id": viaje_id,
                "estado": "retrasado",
                "ubicacion_nombre": f"Frontera {ad_info['nombre']}",
                "pais": "Frontera",
                "latitud": float(ad_info.get("latitud") or 14.0),
                "longitud": float(ad_info.get("longitud") or -89.5),
                "notas": f"INCIDENTE REPORTADO: {esc['incidente']}",
                "fecha_evento": inc_dt.isoformat()
            }).execute()

        # Checkpoint 5: Entrega (si entregado)
        if esc["estado"] == "entregado" and real_dt:
            sb.table("viaje_checkpoints").insert({
                "viaje_id": viaje_id,
                "estado": "entregado",
                "ubicacion_nombre": f"Destino Final: {tienda['nombre']}",
                "pais": esc["pais"],
                "latitud": 13.6929,
                "longitud": -89.2182,
                "notas": f"Viaje Finalizado y descargado en {tienda['nombre']}. Sello de conformidad digital.",
                "fecha_evento": real_dt.isoformat()
            }).execute()

    print("¡Base de datos poblada exitosamente con datos operativos y financieros enriquecidos!")

if __name__ == "__main__":
    asyncio.run(main())
