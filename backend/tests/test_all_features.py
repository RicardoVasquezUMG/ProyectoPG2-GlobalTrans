import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.report_service import ReportService
from app.services.gasto_service import GastoService
from app.services.viaje_service import ViajeService
from app.models.gasto import GastoViajeCreate

async def test_algoritmo_prediccion_tiempos():
    """Prueba el algoritmo de predicción de tiempos con estacionalidad de catálogo."""
    # Probar temporada alta de catálogo (Octubre)
    pred_alta = await ReportService.get_prediccion_estacional_aduanas(mes=10)
    assert pred_alta["es_temporada_alta"] is True
    assert pred_alta["factor_demora"] > 1.5
    assert len(pred_alta["predicciones"]) > 0
    assert len(pred_alta["rutas_eficientes_recomendadas"]) > 0

    # Probar temporada regular (Junio)
    pred_reg = await ReportService.get_prediccion_estacional_aduanas(mes=6)
    assert pred_reg["es_temporada_alta"] is False
    assert pred_reg["factor_demora"] < 1.3
    assert pred_alta["factor_demora"] > pred_reg["factor_demora"]

async def test_auditoria_digital_entregas():
    """Prueba las métricas de auditoría digital de entregas y SLA."""
    aud = await ReportService.get_auditoria()
    assert "porcentaje_exito_tiempo" in aud
    assert "total_viajes" in aud
    assert aud["total_viajes"] > 0
    assert "desglose_por_pais" in aud
    assert len(aud["desglose_por_pais"]) > 0
    assert "incidentes_recientes" in aud

async def test_dashboard_financiero_rentabilidad():
    """Prueba el dashboard financiero de rentabilidad cruzando tiempo con costo."""
    fin = await ReportService.get_dashboard_financiero()
    assert "resumen_ejecutivo" in fin
    resumen = fin["resumen_ejecutivo"]
    assert resumen["total_ingresos_usd"] > 0
    assert resumen["total_costos_usd"] > 0
    assert resumen["margen_global_pct"] > 0
    assert len(fin["rutas"]) > 0

    # Verificar cruce de factor tiempo vs costo en cada corredor
    for r in fin["rutas"]:
        assert r["costo_total_usd"] > 0
        assert r["tiempo_promedio_horas"] > 0
        assert r["costo_por_hora"] > 0
        assert "margen_pct" in r

async def test_registro_gastos_viaje():
    """Prueba el registro y totalización de costos y sobrecostos operativos."""
    viajes = await ViajeService.get_all()
    assert len(viajes) > 0
    test_viaje_id = viajes[0]["id"]

    # Guardar costos operativos
    gasto_data = GastoViajeCreate(
        flete_base=1200.0,
        multas_aduana=150.0,
        viaticos_extra=90.0,
        parqueo_almacenaje=60.0,
        otros_imprevistos=20.0,
        notas="Prueba de liquidación de costos con sobrecostos aduaneros"
    )
    saved = await GastoService.save_or_update(test_viaje_id, gasto_data)
    assert saved["total_sobrecostos"] == 320.0  # 150 + 90 + 60 + 20
    assert saved["total_gasto"] == 1520.0       # 1200 + 320

    # Recuperar
    loaded = await GastoService.get_by_viaje(test_viaje_id)
    assert loaded is not None
    assert loaded["total_sobrecostos"] == 320.0
    assert loaded["total_gasto"] == 1520.0

if __name__ == "__main__":
    async def main():
        print("1. Ejecutando test_algoritmo_prediccion_tiempos...")
        await test_algoritmo_prediccion_tiempos()
        print("   -> OK!")
        print("2. Ejecutando test_auditoria_digital_entregas...")
        await test_auditoria_digital_entregas()
        print("   -> OK!")
        print("3. Ejecutando test_dashboard_financiero_rentabilidad...")
        await test_dashboard_financiero_rentabilidad()
        print("   -> OK!")
        print("4. Ejecutando test_registro_gastos_viaje...")
        await test_registro_gastos_viaje()
        print("   -> OK!")
        print("\n¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE (4/4)!")

    asyncio.run(main())
