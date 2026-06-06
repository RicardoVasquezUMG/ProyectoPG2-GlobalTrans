import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { getAuditoria, getInteligenciaRutas, getPrediccionAduanas, getDashboardFinanciero } from '../../api/reportsApi';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportsAndAuditPage() {
  const [auditoria, setAuditoria] = useState(null);
  const [rutasStats, setRutasStats] = useState([]);
  const [prediccionData, setPrediccionData] = useState(null);
  const [financieroData, setFinancieroData] = useState(null);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  const meses = [
    { label: 'Enero (Regular)', value: 1 },
    { label: 'Febrero (Regular)', value: 2 },
    { label: 'Marzo (Regular)', value: 3 },
    { label: 'Abril (Semana Santa / Pico)', value: 4 },
    { label: 'Mayo (Temporada Alta - Día de la Madre)', value: 5 },
    { label: 'Junio (Regular)', value: 6 },
    { label: 'Julio (Bono 14)', value: 7 },
    { label: 'Agosto (Regular)', value: 8 },
    { label: 'Septiembre (Patrio)', value: 9 },
    { label: 'Octubre (Temporada Alta - Catálogo Fin de Año)', value: 10 },
    { label: 'Noviembre (Temporada Alta - Black Friday / Catálogos)', value: 11 },
    { label: 'Diciembre (Temporada Alta - Navidad / Máximo Pico)', value: 12 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedMes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditData, rutasData, predData, finData] = await Promise.all([
        getAuditoria(),
        getInteligenciaRutas(),
        getPrediccionAduanas(selectedMes),
        getDashboardFinanciero()
      ]);
      setAuditoria(auditData);
      setRutasStats(rutasData);
      setPrediccionData(predData);
      setFinancieroData(finData);
    } catch (error) {
      showError('Error al cargar datos de auditoría y análisis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  const exportCSV = () => {
    try {
      if (!financieroData?.rutas || financieroData.rutas.length === 0) {
        showError('No hay datos disponibles para exportar.');
        return;
      }

      const headers = [
        'Corredor Logistico',
        'Pais Destino',
        'Viajes Realizados',
        'Tiempo Promedio (hrs)',
        'Tarifa Promedio (USD)',
        'Flete Base (USD)',
        'Multas y Parqueos (USD)',
        'Viaticos (USD)',
        'Costo Total (USD)',
        'Margen Neto (%)',
        'Cumplimiento On-Time (%)'
      ];

      const rows = financieroData.rutas.map(r => [
        `"${r.ruta || ''}"`,
        `"${r.pais_destino || ''}"`,
        r.viajes_realizados || 0,
        r.tiempo_promedio_horas || 0,
        r.tarifa_promedio_usd || 0,
        r.flete_base_usd || 0,
        r.multas_y_parqueos_usd || 0,
        r.viaticos_usd || 0,
        r.costo_total_usd || 0,
        r.margen_pct || 0,
        r.entregas_a_tiempo_pct || 0
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `auditoria_leadtimes_globaltrans_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Reporte digital exportado exitosamente a CSV');
    } catch (err) {
      showError('Error al generar el archivo CSV');
    }
  };

  if (loading || !auditoria) return <LoadingSpinner />;

  return (
    <div className="reports-audit-page p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="m-0 text-2xl font-bold">Auditoría Digital, Inteligencia de Rutas y Finanzas</h1>
          <p className="text-500 m-0 mt-1">Predicción estacional de tiempos de espera en aduanas y rentabilidad operativa</p>
        </div>
        <div className="flex gap-2">
          <Button label="Exportar Auditoría (CSV)" icon="pi pi-file-export" className="p-button-outlined" onClick={exportCSV} />
          <Button label="Recargar" icon="pi pi-refresh" onClick={loadData} />
        </div>
      </div>

      <TabView>
        {/* TAB 1: AUDITORÍA DIGITAL Y LEAD TIMES */}
        <TabPanel header="Auditoría de Entregas y Lead Times" leftIcon="pi pi-check-circle mr-2">
          <div className="grid">
            <div className="col-12 md:col-4">
              <Card className="h-full shadow-2 border-round-xl">
                <h3 className="mt-0 text-primary">Cumplimiento Global (On-Time)</h3>
                <div className="text-center my-4">
                  <span className="text-6xl font-bold" style={{ color: auditoria.porcentaje_exito_tiempo > 80 ? 'var(--green-500)' : 'var(--orange-500)' }}>
                    {auditoria.porcentaje_exito_tiempo}%
                  </span>
                  <p className="text-500 mt-2">de {auditoria.total_entregados} viajes entregados dentro de la ventana de tiempo</p>
                </div>
                <ProgressBar value={auditoria.porcentaje_exito_tiempo} color={auditoria.porcentaje_exito_tiempo > 80 ? 'var(--green-500)' : 'var(--orange-500)'} displayValueTemplate={() => <></>} />
              </Card>
            </div>

            <div className="col-12 md:col-8">
              <Card className="h-full shadow-2 border-round-xl" title="Auditoría Digital: Lead Time Planificado vs. Tiempo Real">
                <p className="text-500 text-sm mb-3">Medición de porcentaje de éxito y desviaciones operativas por país de destino</p>
                <DataTable value={financieroData?.rutas || []} responsiveLayout="scroll">
                  <Column field="pais_destino" header="País Destino" sortable />
                  <Column field="tiempo_promedio_horas" header="Lead Time Promedio" body={(r) => `${r.tiempo_promedio_horas} hrs`} sortable />
                  <Column field="viajes_realizados" header="Viajes Totales" sortable />
                  <Column field="entregas_a_tiempo_pct" header="% Éxito Entrega" sortable body={(r) => (
                    <Tag severity={r.entregas_a_tiempo_pct >= 85 ? 'success' : 'warning'} value={`${r.entregas_a_tiempo_pct}%`} />
                  )} />
                </DataTable>
              </Card>
            </div>

            <div className="col-12 mt-4">
              <Card className="shadow-2 border-round-xl" title="Historial Reciente de Retrasos e Incidentes">
                <DataTable value={auditoria.incidentes_recientes} paginator rows={5} emptyMessage="No hay incidentes reportados">
                  <Column field="fecha" header="Fecha y Hora" body={(rowData) => formatDate(rowData.fecha)} sortable />
                  <Column field="ubicacion" header="Ubicación / Frontera" />
                  <Column field="notas" header="Detalle del Incidente" />
                </DataTable>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* TAB 2: ALGORITMO DE PREDICCIÓN DE ADUANAS Y ESTACIONALIDAD */}
        <TabPanel header="Predicción Estacional de Aduanas" leftIcon="pi pi-compass mr-2">
          <div className="flex flex-column gap-3">
            <Card className="shadow-2 border-round-xl">
              <div className="flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 className="m-0 text-primary">Algoritmo Predictivo de Tiempos Fronterizos</h3>
                  <p className="text-500 text-sm m-0 mt-1">
                    Evaluación histórica y factores de estacionalidad (campañas masivas de venta por catálogo / fin de año).
                  </p>
                </div>
                <div className="flex align-items-center gap-2">
                  <label htmlFor="mesSelect" className="font-bold">Mes a Evaluar:</label>
                  <Dropdown
                    id="mesSelect"
                    value={selectedMes}
                    options={meses}
                    onChange={(e) => setSelectedMes(e.value)}
                    style={{ minWidth: '280px' }}
                  />
                </div>
              </div>

              {prediccionData && (
                <div className="mt-4 p-3 border-round surface-ground flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-calendar text-2xl text-primary"></i>
                    <div>
                      <span className="font-bold block">{prediccionData.temporada}</span>
                      <span className="text-500 text-sm">Factor de demora estacional: x{prediccionData.factor_demora}</span>
                    </div>
                  </div>
                  <Tag
                    severity={prediccionData.es_temporada_alta ? 'danger' : 'success'}
                    value={prediccionData.es_temporada_alta ? 'ALTA CONGESTIÓN FRONTERIZA' : 'FLUJO REGULAR'}
                    className="text-base px-3 py-2"
                  />
                </div>
              )}
            </Card>

            <Card className="shadow-2 border-round-xl" title="Predicción de Tiempos y Sugerencias de Rutas Óptimas">
              <DataTable value={prediccionData?.predicciones || []} responsiveLayout="scroll">
                <Column field="aduana" header="Aduana / Frontera" sortable />
                <Column field="pais_destino" header="País" sortable />
                <Column field="tiempo_base_horas" header="Tiempo Base" body={(r) => `${r.tiempo_base_horas} hrs`} sortable />
                <Column field="tiempo_estimado_horas" header="Tiempo Proyectado" body={(r) => (
                  <span className="font-bold text-lg" style={{ color: r.tiempo_estimado_horas > 8 ? 'var(--red-500)' : 'var(--blue-500)' }}>
                    {r.tiempo_estimado_horas} hrs
                  </span>
                )} sortable />
                <Column field="nivel_congestion" header="Congestión" sortable body={(r) => (
                  <Tag severity={r.nivel_congestion === 'Alta' ? 'danger' : (r.nivel_congestion === 'Media' ? 'warning' : 'success')} value={r.nivel_congestion} />
                )} />
                <Column field="sugerencia_ruta" header="Ruta Recomendada / Estrategia" body={(r) => (
                  <span className="text-sm font-medium text-700">{r.sugerencia_ruta}</span>
                )} />
              </DataTable>
            </Card>
          </div>
        </TabPanel>

        {/* TAB 3: DASHBOARD FINANCIERO Y COSTOS OPERATIVOS */}
        <TabPanel header="Dashboard Financiero y Rentabilidad" leftIcon="pi pi-dollar mr-2">
          {financieroData && (
            <div className="flex flex-column gap-4">
              {/* Resumen de Rentabilidad */}
              <div className="grid">
                <div className="col-12 md:col-3">
                  <div className="p-4 shadow-2 border-round surface-card border-left-3 border-blue-500">
                    <span className="text-500 block text-sm font-medium">Ingresos Totales (Tarifas)</span>
                    <span className="text-2xl font-bold text-900 block mt-2">${financieroData.resumen_ejecutivo.total_ingresos_usd.toLocaleString()}</span>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="p-4 shadow-2 border-round surface-card border-left-3 border-orange-500">
                    <span className="text-500 block text-sm font-medium">Costos Operativos Totales</span>
                    <span className="text-2xl font-bold text-900 block mt-2">${financieroData.resumen_ejecutivo.total_costos_usd.toLocaleString()}</span>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="p-4 shadow-2 border-round surface-card border-left-3 border-red-500">
                    <span className="text-500 block text-sm font-medium">Sobrecostos Imprevistos (Multas/Parqueos)</span>
                    <span className="text-2xl font-bold text-red-500 block mt-2">${financieroData.resumen_ejecutivo.total_sobrecostos_imprevistos_usd.toLocaleString()}</span>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="p-4 shadow-2 border-round surface-card border-left-3 border-green-500">
                    <span className="text-500 block text-sm font-medium">Margen Neto Global</span>
                    <span className="text-2xl font-bold text-green-500 block mt-2">{financieroData.resumen_ejecutivo.margen_global_pct}% (${financieroData.resumen_ejecutivo.utilidad_neta_usd.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Matriz Rentabilidad por Ruta: Tiempo vs Costo */}
              <Card className="shadow-2 border-round-xl" title="Rentabilidad Exacta por Ruta Internacional (Tiempo vs. Costo)">
                <DataTable value={financieroData.rutas} responsiveLayout="scroll">
                  <Column field="ruta" header="Corredor Logístico" sortable />
                  <Column field="tarifa_promedio_usd" header="Tarifa Promedio" body={(r) => `$${r.tarifa_promedio_usd}`} sortable />
                  <Column field="flete_base_usd" header="Flete Base" body={(r) => `$${r.flete_base_usd}`} sortable />
                  <Column field="multas_y_parqueos_usd" header="Multas & Parqueos" body={(r) => <span className="text-red-500 font-bold">${r.multas_y_parqueos_usd}</span>} sortable />
                  <Column field="viaticos_usd" header="Viáticos" body={(r) => `$${r.viaticos_usd}`} sortable />
                  <Column field="costo_total_usd" header="Costo Total" body={(r) => `$${r.costo_total_usd}`} sortable />
                  <Column field="tiempo_promedio_horas" header="Tiempo Promedio" body={(r) => `${r.tiempo_promedio_horas} hrs`} sortable />
                  <Column field="costo_por_hora" header="Costo / Hora" body={(r) => `$${r.costo_por_hora}/hr`} sortable />
                  <Column field="margen_pct" header="Margen Neto" sortable body={(r) => (
                    <Tag severity={r.margen_pct >= 30 ? 'success' : (r.margen_pct >= 20 ? 'info' : 'warning')} value={`${r.margen_pct}% ($${r.margen_usd})`} />
                  )} />
                </DataTable>
              </Card>
            </div>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
}

