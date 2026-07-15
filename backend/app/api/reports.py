from fastapi import APIRouter, Depends
from app.services.report_service import ReportService
from app.dependencies import require_roles
from app.config import UserRole

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/dashboard-kpis")
async def get_dashboard_kpis(user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Obtiene los KPIs para el dashboard."""
    return await ReportService.get_dashboard_kpis()

@router.get("/auditoria")
async def get_auditoria(user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Obtiene datos de auditoría de entregas e incidentes."""
    return await ReportService.get_auditoria()

@router.get("/inteligencia-rutas")
async def get_inteligencia_rutas(user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Obtiene análisis predictivo y tiempos de aduanas."""
    return await ReportService.get_inteligencia_rutas()

@router.get("/prediccion-aduanas")
async def get_prediccion_aduanas(mes: int = None, user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Algoritmo de predicción de tiempos de espera en aduanas según estacionalidad (temporada alta de catálogos)."""
    return await ReportService.get_prediccion_estacional_aduanas(mes=mes)

@router.get("/dashboard-financiero")
async def get_dashboard_financiero(user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    """Dashboard financiero gerencial de rentabilidad por ruta internacional cruzando tiempo y costos."""
    return await ReportService.get_dashboard_financiero()

@router.get("/viaje/{viaje_id}/ficha-auditoria")
async def get_ficha_auditoria_viaje(viaje_id: str, user=Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2, UserRole.LEVEL_3))):
    """Obtiene la ficha y bitácora de auditoría digital inmutable de un viaje."""
    return await ReportService.get_ficha_auditoria_viaje(viaje_id)

