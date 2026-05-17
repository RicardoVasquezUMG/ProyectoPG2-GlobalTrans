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
