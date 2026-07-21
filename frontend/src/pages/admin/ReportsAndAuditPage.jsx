import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { getAuditoria, getInteligenciaRutas, getPrediccionAduanas } from '../../api/reportsApi';
import { exportAuditoriaPDF, exportPrediccionAduanasPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportsAndAuditPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [auditoria, setAuditoria] = useState(null);
  const [rutasStats, setRutasStats] = useState([]);
  const [prediccionData, setPrediccionData] = useState(null);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const chartLeadTimeRef = useRef(null);
  const chartIncidentesRef = useRef(null);
  const chartAduanasRef = useRef(null);

  const { showError, showSuccess } = useToast();

  const meses = [
    { label: 'Enero (Campaña Escolar)', value: 1 },
    { label: 'Febrero (Campaña Escolar)', value: 2 },
    { label: 'Marzo (Temporada Regular)', value: 3 },
    { label: 'Abril (Semana Santa / Turismo)', value: 4 },
    { label: 'Mayo (TEMPORADA ALTA - Día de la Madre)', value: 5 },
    { label: 'Junio (Temporada Regular)', value: 6 },
    { label: 'Julio (Bono 14)', value: 7 },
    { label: 'Agosto (Temporada Regular)', value: 8 },
    { label: 'Septiembre (Fiestas Patrias)', value: 9 },
    { label: 'Octubre (TEMPORADA ALTA - Lanzamiento Catálogo Fin de Año)', value: 10 },
    { label: 'Noviembre (TEMPORADA ALTA - Black Friday / Catálogos)', value: 11 },
    { label: 'Diciembre (TEMPORADA ALTA - Campaña Navideña Máxima)', value: 12 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedMes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditData, rutasData, predData] = await Promise.all([
        getAuditoria(),
        getInteligenciaRutas(),
        getPrediccionAduanas(selectedMes)
      ]);
      setAuditoria(auditData);
      setRutasStats(rutasData);
      setPrediccionData(predData);
    } catch (error) {
      showError('Error al cargar datos de auditoría e inteligencia logística');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('es-GT', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getChartCanvasData = (chartRef) => {
    try {
      if (chartRef?.current) {
        const canvas = chartRef.current.getCanvas ? chartRef.current.getCanvas() : chartRef.current;
        if (canvas && typeof canvas.toDataURL === 'function') {
          return canvas.toDataURL('image/png');
        }
      }
    } catch (e) {
      console.warn('Canvas not ready for export:', e);
    }
    return null;
  };

  const handleExportAuditoriaPDF = async () => {
    try {
      setGeneratingPdf(true);
      const chartImg = getChartCanvasData(chartLeadTimeRef);
      await exportAuditoriaPDF(auditoria, chartImg);
      showSuccess('Reporte de Auditoría Digital descargado exitosamente en PDF');
    } catch (e) {
      showError('Error al generar el PDF de auditoría');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportPrediccionPDF = async () => {
    try {
      setGeneratingPdf(true);
      const chartImg = getChartCanvasData(chartAduanasRef);
      await exportPrediccionAduanasPDF(prediccionData, chartImg);
      showSuccess('Informe Predictivo de Aduanas descargado exitosamente en PDF');
    } catch (e) {
      showError('Error al generar el PDF de predicción');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading || !auditoria) return <LoadingSpinner />;

  // =========================================================================
  // GRÁFICOS OPTIMIZADOS (LEGIBLES Y SIN SOLAPAMIENTO)
  // =========================================================================

  // Gráfica 1: Cumplimiento y Lead Time por País (Tab Auditoría)
  const chartLeadTimeData = {
    labels: (auditoria?.desglose_por_pais || []).map((p) => p.pais),
    datasets: [
      {
        label: 'Lead Time Promedio (Horas)',
        backgroundColor: '#3b82f6',
        data: (auditoria?.desglose_por_pais || []).map((p) => p.lead_time_promedio_horas || 0),
        borderRadius: 5,
        yAxisID: 'y'
      },
      {
        label: '% Cumplimiento SLA (On-Time)',
        backgroundColor: '#10b981',
        data: (auditoria?.desglose_por_pais || []).map((p) => p.cumplimiento_pct || 0),
        borderRadius: 5,
        yAxisID: 'y1'
      }
    ]
  };

  const chartLeadTimeOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 12, weight: 'bold' },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 0) {
              return ` ${context.dataset.label}: ${context.parsed.y} hrs`;
            }
            return ` ${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-color)',
          font: { size: 12, weight: 'bold' }
        },
        grid: { display: false }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Lead Time (Horas)',
          color: '#3b82f6',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#3b82f6',
          callback: (value) => `${value}h`
        },
        grid: { color: 'rgba(160, 160, 160, 0.1)', drawBorder: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Cumplimiento SLA (%)',
          color: '#10b981',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#10b981',
          callback: (value) => `${value}%`
        },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Gráfica 1.1: Causas Raíz de Incidentes (Doughnut)
  const incidentesCat = auditoria?.incidentes_por_categoria || {};
  const chartIncidentesData = {
    labels: Object.keys(incidentesCat),
    datasets: [
      {
        data: Object.values(incidentesCat),
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'],
        hoverBackgroundColor: ['#dc2626', '#d97706', '#2563eb', '#7c3aed', '#475569'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const chartIncidentesOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 11 },
          padding: 14,
          usePointStyle: true
        }
      }
    }
  };

  // Gráfica 2: Aduanas - Tiempo Base vs Proyectado
  // SE USA HORIZONTAL BAR CHART (indexAxis: 'y') PARA QUE LOS NOMBRES LARGOS DE ADUANAS NUNCA SE TRASLAPEN
  const aduanasTop = (prediccionData?.predicciones || []).slice(0, 7);
  const chartAduanasData = {
    labels: aduanasTop.map((p) => p.aduana.replace('Aduana ', '').replace('Frontera ', '')),
    datasets: [
      {
        label: 'Tiempo Regular Base (Horas)',
        backgroundColor: '#64748b',
        data: aduanasTop.map((p) => p.tiempo_base_horas),
        borderRadius: 4
      },
      {
        label: `Tiempo Proyectado (${prediccionData?.temporada ? prediccionData.temporada.split('(')[0].trim() : 'Estacional'})`,
        backgroundColor: prediccionData?.es_temporada_alta ? '#ef4444' : '#0ea5e9',
        data: aduanasTop.map((p) => p.tiempo_estimado_horas),
        borderRadius: 4
      }
    ]
  };

  const chartAduanasOptions = {
    indexAxis: 'y', // Barras horizontales garantizan lectura perfecta sin solapamiento
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 12, weight: 'bold' },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.x} hrs de espera`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-color-secondary)',
          callback: (value) => `${value}h`
        },
        grid: { color: 'rgba(160, 160, 160, 0.1)', drawBorder: false }
      },
      y: {
        ticks: {
          color: 'var(--text-color)',
          font: { size: 12, weight: 'bold' }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="reports-audit-page p-4">
      {/* =========================================================================
          ENCABEZADO PRINCIPAL DE LA PÁGINA
         ========================================================================= */}
      <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="m-0 text-2xl font-bold flex align-items-center gap-2">
            <i className="pi pi-shield text-primary text-3xl"></i>
            Auditoría Digital de Entregas & Inteligencia de Rutas IA
          </h1>
          <p className="text-500 m-0 mt-1">
            Certificación de acuerdos de entrega (SLA), algoritmo de predicción aduanera y optimización estacional de rutas
          </p>
        </div>

        <div className="flex gap-2 flex-wrap align-items-center">
          <Button
            label={activeTab === 0 ? 'Descargar Auditoría (PDF)' : 'Descargar Predicción Rutas (PDF)'}
            icon="pi pi-file-pdf"
            severity="danger"
            loading={generatingPdf}
            className="font-bold shadow-1"
            onClick={activeTab === 0 ? handleExportAuditoriaPDF : handleExportPrediccionPDF}
          />
          <Button
            label="Actualizar Datos"
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={loadData}
          />
        </div>
      </div>

      {/* =========================================================================
          TABVIEW CON LAS 2 SECCIONES CLAVE
         ========================================================================= */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* =========================================================================
            TAB 1: AUDITORÍA DIGITAL DE ENTREGAS & CUMPLIMIENTO SLA
           ========================================================================= */}
        <TabPanel header="Auditoría de Entregas & Cumplimiento SLA" leftIcon="pi pi-check-circle mr-2">
          {/* Fila de Tarjetas KPI */}
          <div className="grid mb-4">
            <div className="col-12 sm:col-6 md:col-3">
              <Card className="h-full shadow-2 border-round-xl border-left-3 border-green-500">
                <span className="text-500 text-xs font-semibold uppercase block">Cumplimiento Global (On-Time SLA)</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-green-600">
                    {auditoria.porcentaje_exito_tiempo}%
                  </span>
                  <span className="text-xs text-500 block mt-1">
                    {auditoria.entregas_a_tiempo} de {auditoria.total_entregados} viajes dentro de ventana
                  </span>
                </div>
                <ProgressBar
                  value={auditoria.porcentaje_exito_tiempo}
                  color={auditoria.porcentaje_exito_tiempo >= 80 ? 'var(--green-500)' : 'var(--orange-500)'}
                  displayValueTemplate={() => <></>}
                  style={{ height: '6px' }}
                />
              </Card>
            </div>

            <div className="col-12 sm:col-6 md:col-3">
              <Card className="h-full shadow-2 border-round-xl border-left-3 border-blue-500">
                <span className="text-500 text-xs font-semibold uppercase block">Total Viajes Auditados</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-blue-900">
                    {auditoria.total_viajes}
                  </span>
                  <span className="text-xs text-500 block mt-1">
                    {auditoria.total_entregados} finalizados con acta digital
                  </span>
                </div>
                <div className="text-xs text-blue-600 font-semibold"><i className="pi pi-check-circle mr-1"></i>Trazabilidad verificada</div>
              </Card>
            </div>

            <div className="col-12 sm:col-6 md:col-3">
              <Card className="h-full shadow-2 border-round-xl border-left-3 border-teal-500">
                <span className="text-500 text-xs font-semibold uppercase block">Lead Time Promedio</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-teal-600">
                    {auditoria.lead_time_promedio_horas}
                  </span>
                  <span className="text-xs text-500 block mt-1">Horas de tránsito promedio</span>
                </div>
                <div className="text-xs text-teal-700 font-semibold">Despacho central a destino</div>
              </Card>
            </div>

            <div className="col-12 sm:col-6 md:col-3">
              <Card className="h-full shadow-2 border-round-xl border-left-3 border-red-500">
                <span className="text-500 text-xs font-semibold uppercase block">Incidentes Reportados</span>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-red-500">
                    {auditoria.incidentes_recientes?.length || 0}
                  </span>
                  <span className="text-xs text-500 block mt-1">Eventos en aduanas o carretera</span>
                </div>
                <Button
                  label="Descargar Informe PDF"
                  icon="pi pi-file-pdf"
                  className="p-button-text p-button-sm p-0 text-red-600 font-bold"
                  onClick={handleExportAuditoriaPDF}
                />
              </Card>
            </div>
          </div>

          {/* Gráficos de Rendimiento y Causas */}
          <div className="grid mb-4">
            <div className="col-12 lg:col-7">
              <Card className="shadow-2 border-round-xl h-full" title="Rendimiento Comparativo: Horas Lead Time vs. % Cumplimiento SLA">
                <p className="text-500 text-xs mb-3">Evaluación simultánea del tiempo transcurrido contra el nivel de servicio acordado</p>
                <div style={{ height: '340px' }}>
                  <Chart ref={chartLeadTimeRef} type="bar" data={chartLeadTimeData} options={chartLeadTimeOptions} />
                </div>
              </Card>
            </div>
            <div className="col-12 lg:col-5">
              <Card className="shadow-2 border-round-xl h-full" title="Distribución de Causas Raíz de Incidentes">
                <p className="text-500 text-xs mb-3">Clasificación de demoras documentales, de infraestructura y aduaneras</p>
                <div style={{ height: '340px' }}>
                  <Chart ref={chartIncidentesRef} type="doughnut" data={chartIncidentesData} options={chartIncidentesOptions} />
                </div>
              </Card>
            </div>
          </div>

          {/* Tabla de Desglose por País de Destino */}
          <Card className="shadow-2 border-round-xl mb-4" title="Auditoría Digital de Entregas por Territorio Internacional">
            <DataTable value={auditoria.desglose_por_pais || []} responsiveLayout="scroll">
              <Column field="pais" header="País Destino" sortable />
              <Column field="total_viajes" header="Viajes Totales" sortable />
              <Column field="entregados" header="Entregados" sortable />
              <Column field="a_tiempo" header="A Tiempo" sortable />
              <Column
                field="cumplimiento_pct"
                header="% Cumplimiento SLA"
                sortable
                body={(r) => (
                  <Tag
                    severity={r.cumplimiento_pct >= 85 ? 'success' : (r.cumplimiento_pct >= 70 ? 'warning' : 'danger')}
                    value={`${r.cumplimiento_pct}%`}
                    className="font-bold px-3 py-1"
                  />
                )}
              />
              <Column field="lead_time_promedio_horas" header="Lead Time Promedio" body={(r) => `${r.lead_time_promedio_horas} hrs`} sortable />
            </DataTable>
          </Card>

          {/* Bitácora Digital de Incidentes Recientes */}
          <Card className="shadow-2 border-round-xl" title="Bitácora Digital de Incidentes y Retrasos en Tránsito">
            <DataTable value={auditoria.incidentes_recientes} paginator rows={6} emptyMessage="No hay incidentes reportados">
              <Column field="fecha" header="Fecha y Hora" body={(r) => formatDate(r.fecha)} sortable style={{ width: '180px' }} />
              <Column field="ubicacion" header="Punto Geográfico / Aduana" style={{ width: '220px' }} />
              <Column field="notas" header="Causa Raíz / Detalle Operativo del Incidente" />
            </DataTable>
          </Card>
        </TabPanel>

        {/* =========================================================================
            TAB 2: ALGORITMO PREDICTIVO DE ADUANAS & RUTAS ÓPTIMAS
           ========================================================================= */}
        <TabPanel header="Predicción Estacional de Aduanas & Rutas Óptimas" leftIcon="pi pi-compass mr-2">
          <div className="flex flex-column gap-4">
            {/* Banner de Simulación Estacional y Selector de Mes */}
            <Card className="shadow-2 border-round-xl">
              <div className="flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 className="m-0 text-primary flex align-items-center gap-2">
                    <i className="pi pi-bolt text-2xl"></i>
                    Algoritmo de Simulación Fronteriza & Estacionalidad de Catálogos
                  </h3>
                  <p className="text-500 text-sm m-0 mt-1">
                    Evaluación de colas aduaneras según ciclos de campañas masivas de venta por catálogo y feriados centroamericanos
                  </p>
                </div>
                <div className="flex align-items-center gap-2">
                  <label htmlFor="mesSelect" className="font-bold text-sm">Simular Mes:</label>
                  <Dropdown
                    id="mesSelect"
                    value={selectedMes}
                    options={meses}
                    onChange={(e) => setSelectedMes(e.value)}
                    style={{ minWidth: '320px' }}
                  />
                  <Button
                    label="Exportar PDF"
                    icon="pi pi-file-pdf"
                    severity="danger"
                    outlined
                    onClick={handleExportPrediccionPDF}
                  />
                </div>
              </div>

              {prediccionData && (
                <div className={`mt-3 p-3 border-round border-1 flex justify-content-between align-items-center flex-wrap gap-3 ${prediccionData.es_temporada_alta ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex align-items-center gap-3">
                    <i className={`pi pi-calendar text-3xl ${prediccionData.es_temporada_alta ? 'text-red-500' : 'text-primary'}`}></i>
                    <div>
                      <span className="font-bold text-lg block text-900">{prediccionData.temporada}</span>
                      <span className="text-600 text-sm block">{prediccionData.motivo_estacional}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Tag
                      severity={prediccionData.es_temporada_alta ? 'danger' : 'info'}
                      value={prediccionData.es_temporada_alta ? 'PICO DE CATÁLOGOS: DEMORAS CRÍTICAS' : 'TRÁNSITO FRONTERIZO REGULAR'}
                      className="text-sm px-3 py-2 font-bold mb-1"
                    />
                    <span className="text-xs text-700 block font-semibold">Multiplicador estacional: <strong>x{prediccionData.factor_demora}</strong></span>
                  </div>
                </div>
              )}
            </Card>

            {/* Panel de Recomendaciones de Rutas Eficientes (Route Efficiency Engine) */}
            <Card
              className="shadow-2 border-round-xl border-left-3 border-teal-500"
              title={
                <div className="flex align-items-center gap-2 text-teal-700">
                  <i className="pi pi-directions text-2xl"></i>
                  <span>Motor de Rutas Eficientes Sugeridas (Plan de Desvíos Óptimos)</span>
                </div>
              }
            >
              <p className="text-500 text-sm mb-3">
                El algoritmo analiza el tráfico acumulado en cada aduana para sugerir pasos alternos y horarios desfasados que eviten cuellos de botella
              </p>

              <div className="grid">
                {(prediccionData?.rutas_eficientes_recomendadas || []).map((ruta, idx) => (
                  <div key={idx} className="col-12 md:col-6 mb-3">
                    <div className="p-3 surface-card border-1 border-round-xl shadow-1 h-full flex flex-column justify-content-between">
                      <div>
                        <div className="flex justify-content-between align-items-center mb-2">
                          <span className="font-bold text-primary text-base">{ruta.corredor}</span>
                          <Tag severity="success" value={`Ahorro: -${ruta.ahorro_tiempo_horas} hrs`} className="font-bold" />
                        </div>

                        <div className="flex flex-column gap-1 text-sm mb-3">
                          <div className="flex align-items-center text-600">
                            <span className="font-semibold text-700 mr-2">Ruta Habitual:</span>
                            <span>{ruta.ruta_habitual} ({ruta.tiempo_habitual_espera}h espera)</span>
                          </div>
                          <div className="flex align-items-center text-teal-700 font-semibold">
                            <i className="pi pi-check text-xs mr-2"></i>
                            <span>Ruta Recomendada: {ruta.ruta_eficiente_sugerida} ({ruta.tiempo_eficiente_espera}h espera)</span>
                          </div>
                        </div>

                        <p className="text-xs text-600 m-0 line-height-3 bg-surface-ground p-2 border-round">
                          <i className="pi pi-info-circle mr-1 text-primary"></i>
                          {ruta.estrategia}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-top-1 surface-border flex justify-content-between align-items-center">
                        <span className="text-xs text-500">Ahorro proyectado combustible/viáticos:</span>
                        <span className="text-sm font-bold text-green-600">+${ruta.ahorro_costo_usd} USD por viaje</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Gráfica Comparativa de Tiempos Fronterizos (Horizontal para legibilidad) */}
            <Card className="shadow-2 border-round-xl" title="Impacto del Factor Estacional en Horas de Espera Aduanera">
              <p className="text-500 text-xs mb-3">Comparativa directa entre el tiempo habitual base y la proyección según la campaña analizada</p>
              <div style={{ height: '380px' }}>
                <Chart ref={chartAduanasRef} type="bar" data={chartAduanasData} options={chartAduanasOptions} />
              </div>
            </Card>

            {/* Tabla Detallada con Todas las Aduanas */}
            <Card className="shadow-2 border-round-xl" title="Evaluación Fronteriza y Tiempos de Espera Proyectados">
              <DataTable value={prediccionData?.predicciones || []} responsiveLayout="scroll" paginator rows={7}>
                <Column field="aduana" header="Paso Aduanero / Frontera" sortable />
                <Column field="pais_destino" header="País Destino" sortable />
                <Column field="tiempo_base_horas" header="Tiempo Base" body={(r) => `${r.tiempo_base_horas} hrs`} sortable />
                <Column
                  field="tiempo_estimado_horas"
                  header="Tiempo Proyectado"
                  sortable
                  body={(r) => (
                    <span
                      className="font-bold text-base"
                      style={{ color: r.tiempo_estimado_horas > 8 ? 'var(--red-500)' : 'var(--blue-500)' }}
                    >
                      {r.tiempo_estimado_horas} hrs
                    </span>
                  )}
                />
                <Column
                  field="nivel_congestion"
                  header="Congestión"
                  sortable
                  body={(r) => (
                    <Tag
                      severity={r.nivel_congestion === 'Crítica' || r.nivel_congestion === 'Alta' ? 'danger' : (r.nivel_congestion === 'Media' ? 'warning' : 'success')}
                      value={r.nivel_congestion}
                      className="font-semibold"
                    />
                  )}
                />
                <Column field="horas_pico" header="Horas Pico" />
                <Column field="recomendacion_operativa" header="Recomendación Operativa" />
              </DataTable>
            </Card>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}
