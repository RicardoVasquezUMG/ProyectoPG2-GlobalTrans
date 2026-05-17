import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { getAuditoria, getInteligenciaRutas } from '../../api/reportsApi';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportsAndAuditPage() {
  const [auditoria, setAuditoria] = useState(null);
  const [rutasStats, setRutasStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditData, rutasData] = await Promise.all([
        getAuditoria(),
        getInteligenciaRutas()
      ]);
      setAuditoria(auditData);
      setRutasStats(rutasData);
    } catch (error) {
      showError('Error al cargar datos de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  if (loading || !auditoria) return <LoadingSpinner />;

  return (
    <div className="reports-audit-page p-4">
      <h1 className="mb-4">Auditoría y Análisis de Rutas</h1>

      <div className="grid">
        {/* Panel de Cumplimiento */}
        <div className="col-12 md:col-4">
          <Card className="h-full shadow-2 border-round-xl">
            <h3 className="mt-0 text-primary">Cumplimiento de Entregas</h3>
            <div className="text-center my-5">
              <span className="text-6xl font-bold" style={{ color: auditoria.porcentaje_exito_tiempo > 80 ? 'var(--green-500)' : 'var(--orange-500)' }}>
                {auditoria.porcentaje_exito_tiempo}%
              </span>
              <p className="text-500 mt-2">de {auditoria.total_entregados} viajes entregados a tiempo</p>
            </div>
            <ProgressBar value={auditoria.porcentaje_exito_tiempo} color={auditoria.porcentaje_exito_tiempo > 80 ? 'var(--green-500)' : 'var(--orange-500)'} displayValueTemplate={() => <></>} />
          </Card>
        </div>

        {/* Panel de Inteligencia de Rutas / Aduanas */}
        <div className="col-12 md:col-8">
          <Card className="h-full shadow-2 border-round-xl" title="Inteligencia de Aduanas (Tiempos Promedio)">
            <DataTable value={rutasStats} paginator rows={5} emptyMessage="No hay datos suficientes de aduanas">
              <Column field="aduana" header="Nombre Aduana" sortable />
              <Column field="tiempo_promedio_horas" header="Promedio (Horas)" sortable />
              <Column field="cruces_registrados" header="N° Cruces" sortable />
            </DataTable>
          </Card>
        </div>

        {/* Historial de Incidentes */}
        <div className="col-12 mt-4">
          <Card className="shadow-2 border-round-xl" title="Historial de Incidentes y Retrasos">
            <DataTable value={auditoria.incidentes_recientes} paginator rows={5} emptyMessage="No hay incidentes reportados">
              <Column field="fecha" header="Fecha" body={(rowData) => formatDate(rowData.fecha)} sortable />
              <Column field="ubicacion" header="Ubicación" />
              <Column field="notas" header="Detalle" />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
}
