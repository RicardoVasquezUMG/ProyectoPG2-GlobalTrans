import asyncio
import os
import sys

# Asegurar path para importar la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.tienda import TiendaCreate, TiendaUpdate
from app.services.tienda_service import TiendaService
from app.services.tracking_service import TrackingService
from app.services.route_alert_service import RouteAlertService
from app.services.report_service import ReportService
from app.services.gasto_service import GastoService
from app.models.gasto import GastoViajeCreate
from app.database import get_supabase_admin

async def run_all_tests():
    print("=" * 60)
    print("INICIANDO PRUEBAS DE TODOS LOS CASOS DE USO (GlobalTrans)")
    print("=" * 60)
    
    sb = get_supabase_admin()
    resultados = []

    # -------------------------------------------------------------
    # CP-01: Tiendas - Campo Correo Electrónico
    # -------------------------------------------------------------
    print("\n[CP-01] Probando creación y actualización de Tienda con correo electrónico...")
    try:
        tienda_test = TiendaCreate(
            nombre="Tienda Test San Salvador",
            pais="El Salvador",
            direccion="Colonia Escalón #123, San Salvador",
            email="sucursal.escalon@globaltrans.com",
            latitud="13.7012",
            longitud="-89.2435",
            estado=True
        )
        created_t = await TiendaService.create(tienda_test)
        assert created_t.get("email") == "sucursal.escalon@globaltrans.com", "El correo no coincide"
        print(f"  -> Tienda creada con éxito. ID: {created_t.get('id')} | Email: {created_t.get('email')}")
        
        # Test update
        upd = TiendaUpdate(email="contacto.actualizado@globaltrans.com")
        updated_t = await TiendaService.update(created_t.get("id"), upd)
        assert updated_t.get("email") == "contacto.actualizado@globaltrans.com", "El correo actualizado no coincide"
        print(f"  -> Actualización exitosa. Nuevo Email: {updated_t.get('email')}")
        resultados.append(("CP-01 Tiendas con Email", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-01: {e}")
        resultados.append(("CP-01 Tiendas con Email", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-02: Viajes - Tiempo Estimado de Llegada (ETA)
    # -------------------------------------------------------------
    print("\n[CP-02] Probando cálculo y asignación de ETA en Viajes...")
    try:
        from datetime import datetime, timezone, timedelta
        from app.models.viaje import ViajeCreate
        from app.services.viaje_service import ViajeService

        now = datetime.now(timezone.utc)
        eta_target = now + timedelta(hours=14)

        # Buscar ids para relacionar
        carg = sb.table("cargamentos").select("id").limit(1).execute().data
        veh = sb.table("vehicles").select("id").limit(1).execute().data
        user = sb.table("users").select("id").limit(1).execute().data
        tienda = sb.table("tiendas").select("id").limit(1).execute().data

        if carg and veh and user and tienda:
            v_data = ViajeCreate(
                fecha_plan_salida=now,
                fecha_esperada_llegada=eta_target,
                cargamento_id=carg[0]["id"],
                vehiculo_id=veh[0]["id"],
                tienda_id=tienda[0]["id"],
                usuario_id=user[0]["id"],
                observaciones="Test CP-02 ETA",
                estado="planificado"
            )
            v_created = await ViajeService.create(v_data)
            assert v_created.get("fecha_esperada_llegada") is not None, "ETA no asignado"
            print(f"  -> Viaje creado con ID: {v_created.get('id')}")
            print(f"  -> Salida: {v_created.get('fecha_plan_salida')} | ETA: {v_created.get('fecha_esperada_llegada')}")
            test_viaje_id = v_created.get("id")
            resultados.append(("CP-02 Viajes con ETA", "EXITOSO"))
        else:
            print("  -> Advertencia: No hay suficientes datos para crear el viaje de prueba en CP-02.")
            test_viaje_id = None
            resultados.append(("CP-02 Viajes con ETA", "OMITIDO (Sin dependencias en BD)"))
    except Exception as e:
        print(f"  -> ERROR en CP-02: {e}")
        resultados.append(("CP-02 Viajes con ETA", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-03 & CP-04: Monitoreo - Trazado de Ruta Planificada
    # -------------------------------------------------------------
    print("\n[CP-03 & CP-04] Probando obtención de ruta planificada y waypoints...")
    try:
        # Usamos el viaje de prueba o el primero existente
        viajes_exist = sb.table("viajes").select("id").limit(1).execute().data
        target_id = test_viaje_id or (viajes_exist[0]["id"] if viajes_exist else None)

        if target_id:
            ruta_plan = await TrackingService.obtener_ruta_planificada(target_id)
            assert "waypoints" in ruta_plan and len(ruta_plan["waypoints"]) >= 2, "La ruta no contiene waypoints suficientes"
            print(f"  -> Ruta obtenida para destino: {ruta_plan.get('tienda')} ({ruta_plan.get('pais_destino')})")
            print(f"  -> Total de waypoints trazados: {len(ruta_plan['waypoints'])}")
            print(f"  -> Paradas intermedias: {[p['nombre'] for p in ruta_plan.get('paradas_principales', [])]}")
            resultados.append(("CP-03 & CP-04 Trazado de Rutas", "EXITOSO"))
        else:
            resultados.append(("CP-03 & CP-04 Trazado de Rutas", "OMITIDO (No hay viajes)"))
    except Exception as e:
        print(f"  -> ERROR en CP-03 & CP-04: {e}")
        resultados.append(("CP-03 & CP-04 Trazado de Rutas", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-05 & CP-06: Motor de Alertas (Desvío > 5km y Proximidad < 12h)
    # -------------------------------------------------------------
    print("\n[CP-05 & CP-06] Probando alertas de Desvío Geodésico y Proximidad Horaria...")
    try:
        # 1. Probar ruta El Salvador
        ruta_sv = RouteAlertService.get_planned_route("El Salvador", 13.6929, -89.2182)
        waypoints_sv = ruta_sv["waypoints"]

        # Punto sobre la ruta o muy cerca (< 2 km)
        p_cerca = (13.7189, -89.7242)
        desvio_cerca = RouteAlertService.evaluate_route_deviation(p_cerca[0], p_cerca[1], waypoints_sv)
        print(f"  -> Prueba punto en ruta: Desvío medido = {desvio_cerca} km (Esperado: <= 5.0 km)")
        assert desvio_cerca <= 5.0, "Falso positivo en desvío de ruta"

        # Punto desviado intencionalmente (+25 km al norte)
        p_lejos = (14.2500, -89.5000)
        desvio_lejos = RouteAlertService.evaluate_route_deviation(p_lejos[0], p_lejos[1], waypoints_sv)
        print(f"  -> Prueba punto desviado: Desvío medido = {desvio_lejos} km (Esperado: > 5.0 km)")
        assert desvio_lejos > 5.0, "No detectó el desvío superior a 5 km"

        # Prueba de proximidad a destino < 12 horas
        horas, dist = RouteAlertService.evaluate_proximity_hours(13.7189, -89.7242, 13.6929, -89.2182, speed_kmh=60.0)
        print(f"  -> Prueba proximidad: {dist} km restantes a 60 km/h = {horas} horas (Esperado: <= 12 horas)")
        assert horas <= 12.0, "Debería estar dentro de la ventana de < 12 horas"

        resultados.append(("CP-05 & CP-06 Alertas Desvío y Proximidad", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-05 & CP-06: {e}")
        resultados.append(("CP-05 & CP-06 Alertas Desvío y Proximidad", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-07: Algoritmo de Predicción Estacional de Aduanas
    # -------------------------------------------------------------
    print("\n[CP-07] Probando Algoritmo de Predicción Estacional de Aduanas...")
    try:
        # Mes 11: Noviembre (Temporada Alta de Catálogo / Black Friday)
        pred_nov = await ReportService.get_prediccion_estacional_aduanas(mes=11)
        assert pred_nov["es_temporada_alta"] is True, "Noviembre debe ser detectado como temporada alta"
        assert pred_nov["factor_demora"] > 1.2, "El factor de demora debe ser superior al estándar"
        print(f"  -> Noviembre detectado como: {pred_nov['temporada']} (Factor demora: x{pred_nov['factor_demora']})")
        print(f"  -> Ejemplo Aduana Pedro de Alvarado: Base {pred_nov['predicciones'][0]['tiempo_base_horas']}h -> Estimado {pred_nov['predicciones'][0]['tiempo_estimado_horas']}h | Congestión: {pred_nov['predicciones'][0]['nivel_congestion']}")
        print(f"  -> Sugerencia de ruta: {pred_nov['predicciones'][1]['sugerencia_ruta']}")

        # Mes 2: Febrero (Temporada Regular)
        pred_feb = await ReportService.get_prediccion_estacional_aduanas(mes=2)
        assert pred_feb["es_temporada_alta"] is False, "Febrero debe ser temporada regular"
        print(f"  -> Febrero detectado como: {pred_feb['temporada']} (Factor demora: x{pred_feb['factor_demora']})")
        resultados.append(("CP-07 Predicción Estacional de Aduanas", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-07: {e}")
        resultados.append(("CP-07 Predicción Estacional de Aduanas", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-08: Auditoría Digital de Entregas y Lead Times
    # -------------------------------------------------------------
    print("\n[CP-08] Probando Auditoría Digital de Entregas y Lead Times...")
    try:
        audit = await ReportService.get_auditoria()
        assert "porcentaje_exito_tiempo" in audit, "Debe contener el porcentaje de éxito"
        print(f"  -> Porcentaje de éxito de entregas On-Time: {audit['porcentaje_exito_tiempo']}%")
        print(f"  -> Total de viajes entregados analizados: {audit['total_entregados']}")
        resultados.append(("CP-08 Auditoría Digital de Entregas", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-08: {e}")
        resultados.append(("CP-08 Auditoría Digital de Entregas", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-09: Registro y Totalización de Costos y Sobrecostos de Viaje
    # -------------------------------------------------------------
    print("\n[CP-09] Probando Registro y Totalización de Gastos de Viaje...")
    try:
        dummy_id = test_viaje_id or "test-viaje-001"
        gasto_in = GastoViajeCreate(
            viaje_id=dummy_id,
            flete_base=1200.0,
            multas_aduana=150.0,
            viaticos_extra=75.0,
            parqueo_almacenaje=50.0,
            otros_imprevistos=25.0,
            notas="Retención en aduana por revisión exhaustiva de DUCA"
        )
        saved_gasto = await GastoService.save_or_update(dummy_id, gasto_in)
        assert saved_gasto["total_sobrecostos"] == 300.0, f"Sobrecostos esperado: 300.0, obtenido: {saved_gasto['total_sobrecostos']}"
        assert saved_gasto["total_gasto"] == 1500.0, f"Total gasto esperado: 1500.0, obtenido: {saved_gasto['total_gasto']}"
        print(f"  -> Flete Base: ${saved_gasto['flete_base']}")
        print(f"  -> Sobrecostos (Multa $150 + Viáticos $75 + Parqueo $50 + Otros $25): ${saved_gasto['total_sobrecostos']}")
        print(f"  -> Costo Total del Viaje: ${saved_gasto['total_gasto']}")
        resultados.append(("CP-09 Registro de Gastos y Sobrecostos", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-09: {e}")
        resultados.append(("CP-09 Registro de Gastos y Sobrecostos", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # CP-10: Dashboard Financiero Gerencial
    # -------------------------------------------------------------
    print("\n[CP-10] Probando Dashboard Financiero de Rentabilidad de Rutas...")
    try:
        dash = await ReportService.get_dashboard_financiero()
        assert "resumen_ejecutivo" in dash and "rutas" in dash, "Formato de dashboard financiero inválido"
        res = dash["resumen_ejecutivo"]
        print(f"  -> Ingresos Totales: ${res['total_ingresos_usd']:,.2f}")
        print(f"  -> Costos Operativos: ${res['total_costos_usd']:,.2f}")
        print(f"  -> Sobrecostos Imprevistos: ${res['total_sobrecostos_imprevistos_usd']:,.2f}")
        print(f"  -> Utilidad Neta: ${res['utilidad_neta_usd']:,.2f} (Margen Global: {res['margen_global_pct']}%)")
        print("  -> Corredores analizados:")
        for r in dash["rutas"]:
            ruta_str = r['ruta'].replace('\u2794', '->')
            print(f"     * {ruta_str}: Margen {r['margen_pct']}% | Costo/Hora: ${r['costo_por_hora']}/hr | Lead Time: {r['tiempo_promedio_horas']}h")
        resultados.append(("CP-10 Dashboard Financiero Gerencial", "EXITOSO"))
    except Exception as e:
        print(f"  -> ERROR en CP-10: {e}")
        resultados.append(("CP-10 Dashboard Financiero Gerencial", f"FALLIDO: {e}"))

    # -------------------------------------------------------------
    # RESUMEN FINAL
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("RESUMEN DE RESULTADOS DE PRUEBAS")
    print("=" * 60)
    for nombre, res in resultados:
        print(f"  {nombre:.<45} {res}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
