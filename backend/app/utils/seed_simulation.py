import asyncio
from datetime import datetime, timedelta, timezone
from app.database import get_supabase_admin

async def seed_simulation_data():
    """
    Genera datos simulados completos para Centroamérica:
    - Tiendas regionales con correos y coordenadas exactas.
    - Viajes activos (uno en ruta regular, uno desviado >5km, uno a menos de 12h de destino).
    - Posiciones GPS en tiempo real para visualizar en el mapa y verificar alertas.
    - Checkpoints de aduanas y gastos asociados (flete y sobrecostos).
    """
    sb = get_supabase_admin()
    print("Iniciando simulación de datos para GlobalTrans...")

    # 1. Obtener dependencias necesarias
    cargamentos = sb.table("cargamentos").select("id").limit(5).execute().data
    vehiculos = sb.table("vehicles").select("id, placas").limit(5).execute().data
    pilotos = sb.table("users").select("id").limit(5).execute().data

    if not cargamentos or not vehiculos or not pilotos:
        print("Advertencia: No hay cargamentos, vehículos o usuarios suficientes para vincular viajes.")
        return

    # 2. Tiendas Centroamericanas con Correo y Coordenadas
    tiendas_data = [
        {
            "nombre": "Sucursal San Salvador Escalón",
            "pais": "El Salvador",
            "direccion": "Paseo General Escalón #3400, San Salvador",
            "email": "escalon.sv@globaltrans.com",
            "latitud": "13.7012",
            "longitud": "-89.2435",
            "estado": True
        },
        {
            "nombre": "Sucursal Tegucigalpa Los Próceres",
            "pais": "Honduras",
            "direccion": "Boulevard Los Próceres, Tegucigalpa",
            "email": "proceres.hn@globaltrans.com",
            "latitud": "14.1058",
            "longitud": "-87.1822",
            "estado": True
        },
        {
            "nombre": "Sucursal Managua Metrocentro",
            "pais": "Nicaragua",
            "direccion": "Costado Norte Metrocentro, Managua",
            "email": "metrocentro.ni@globaltrans.com",
            "latitud": "12.1265",
            "longitud": "-86.2658",
            "estado": True
        },
        {
            "nombre": "Sucursal San José Escazú",
            "pais": "Costa Rica",
            "direccion": "Multiplaza Escazú, San José",
            "email": "escazu.cr@globaltrans.com",
            "latitud": "9.9431",
            "longitud": "-84.1502",
            "estado": True
        },
        {
            "nombre": "Sucursal Ciudad de Panamá Costa del Este",
            "pais": "Panamá",
            "direccion": "Avenida Balboa / Costa del Este, Panamá",
            "email": "costadeleste.pa@globaltrans.com",
            "latitud": "9.0125",
            "longitud": "-79.4721",
            "estado": True
        }
    ]

    from app.services.tienda_service import TiendaService
    from app.models.tienda import TiendaCreate, TiendaUpdate
    tiendas_ids = []
    for t in tiendas_data:
        # Upsert o buscar si ya existe
        check = sb.table("tiendas").select("id").eq("nombre", t["nombre"]).execute()
        if check.data:
            t_obj = TiendaUpdate(**t)
            upd = await TiendaService.update(check.data[0]["id"], t_obj)
            tiendas_ids.append(check.data[0]["id"])
        else:
            t_obj = TiendaCreate(**t)
            created = await TiendaService.create(t_obj)
            if created:
                tiendas_ids.append(created["id"])

    print(f"Tiendas actualizadas/creadas: {len(tiendas_ids)}")

    # 3. Viajes de prueba con ETA
    now = datetime.now(timezone.utc)
    
    # Viaje A: En ruta a El Salvador (A MENOS DE 12 HORAS de destino: Sonsonate -> San Salvador)
    viaje_a_data = {
        "fecha_plan_salida": (now - timedelta(hours=6)).isoformat(),
        "fecha_esperada_llegada": (now + timedelta(hours=4)).isoformat(), # ETA en 4 horas (< 12 horas)
        "cargamento_id": cargamentos[0]["id"],
        "vehiculo_id": vehiculos[0]["id"],
        "tienda_id": tiendas_ids[0],
        "usuario_id": pilotos[0]["id"],
        "estado": "en_ruta",
        "observaciones": "Simulación CP-05: Alerta de proximidad (< 12 horas a destino)"
    }
    va = sb.table("viajes").insert(viaje_a_data).execute().data[0]

    # Posición GPS del Viaje A (cerca de Sonsonate / San Salvador en ruta autorizada)
    sb.table("viaje_posicion_actual").upsert({
        "viaje_id": va["id"],
        "latitud": 13.7189,
        "longitud": -89.7242,
        "velocidad": 62.5,
        "fecha_actualizacion": now.isoformat()
    }).execute()

    # Viaje B: Desviado más de 5 km en Honduras (Desvío de ruta hacia zona no autorizada)
    viaje_b_data = {
        "fecha_plan_salida": (now - timedelta(hours=10)).isoformat(),
        "fecha_esperada_llegada": (now + timedelta(hours=20)).isoformat(),
        "cargamento_id": cargamentos[1 % len(cargamentos)]["id"],
        "vehiculo_id": vehiculos[1 % len(vehiculos)]["id"],
        "tienda_id": tiendas_ids[1],
        "usuario_id": pilotos[1 % len(pilotos)]["id"],
        "estado": "en_ruta",
        "observaciones": "Simulación CP-06: Alerta de desvío crítico de ruta (> 5 km fuera de polilínea)"
    }
    vb = sb.table("viajes").insert(viaje_b_data).execute().data[0]

    # Posición GPS del Viaje B (Desviado a 15 km de la carretera de Copán/Tegucigalpa)
    sb.table("viaje_posicion_actual").upsert({
        "viaje_id": vb["id"],
        "latitud": 15.0500, # Fuera de corredor
        "longitud": -88.4200,
        "velocidad": 45.0,
        "fecha_actualizacion": now.isoformat()
    }).execute()

    # Viaje C: En Costa Rica con gastos registrados (Flete + Multa DUCA + Parqueo)
    viaje_c_data = {
        "fecha_plan_salida": (now - timedelta(hours=30)).isoformat(),
        "fecha_esperada_llegada": (now + timedelta(hours=8)).isoformat(),
        "cargamento_id": cargamentos[2 % len(cargamentos)]["id"],
        "vehiculo_id": vehiculos[2 % len(vehiculos)]["id"],
        "tienda_id": tiendas_ids[3],
        "usuario_id": pilotos[2 % len(pilotos)]["id"],
        "estado": "en_aduana",
        "observaciones": "Simulación CP-09: Viaje con gastos y sobrecostos aduanales"
    }
    vc = sb.table("viajes").insert(viaje_c_data).execute().data[0]

    # Posición GPS del Viaje C (Aduana Peñas Blancas)
    sb.table("viaje_posicion_actual").upsert({
        "viaje_id": vc["id"],
        "latitud": 11.2181,
        "longitud": -85.6125,
        "velocidad": 0.0,
        "fecha_actualizacion": now.isoformat()
    }).execute()

    print("Simulación generada exitosamente. Viajes creados con posiciones georreferenciadas y alertas activas.")

if __name__ == "__main__":
    asyncio.run(seed_simulation_data())
