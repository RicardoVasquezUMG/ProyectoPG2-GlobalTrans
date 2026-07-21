import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { getDashboardFinanciero } from '../../api/reportsApi';
import { exportDashboardFinancieroPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DashboardFinancieroPage() {
  const [financieroData, setFinancieroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const chartRentabilidadRef = useRef(null);
  const chartCostosRef = useRef(null);
  const chartTiempoVsCostoRef = useRef(null);

  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardFinanciero();
      setFinancieroData(data);
    } catch (error) {
      showError('Error al cargar datos del Dashboard Financiero');
    } finally {
      setLoading(false);
    }
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

  const handleExportPDF = async () => {
    try {
      setGeneratingPdf(true);
      const chartImg = getChartCanvasData(chartRentabilidadRef);
      await exportDashboardFinancieroPDF(financieroData, chartImg);
      showSuccess('Dashboard Financiero descargado exitosamente en formato PDF');
    } catch (e) {
      showError('Error al generar el PDF del Dashboard Financiero');
    } finally {
      setGeneratingPdf(false);
    }
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
        'Tarifa Cobrada (USD)',
        'Flete Base (USD)',
        'Sobrecostos Aduana/Multas (USD)',
        'Viaticos Extra (USD)',
        'Costo Total (USD)',
        'Lead Time Promedio (hrs)',
        'Costo por Hora (USD/hr)',
        'Margen Neto (%)',
        'Cumplimiento SLA (%)'
      ];

      const rows = financieroData.rutas.map((r) => [
        `"${r.ruta || ''}"`,
        `"${r.pais_destino || ''}"`,
        r.viajes_realizados || 0,
        r.tarifa_promedio_usd || 0,
        r.flete_base_usd || 0,
        r.total_sobrecostos_usd || 0,
        r.viaticos_usd || 0,
        r.costo_total_usd || 0,
        r.tiempo_promedio_horas || 0,
        r.costo_por_hora || 0,
        r.margen_pct || 0,
        r.entregas_a_tiempo_pct || 0
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_financiero_globaltrans_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Reporte financiero exportado exitosamente a CSV');
    } catch (err) {
      showError('Error al exportar CSV');
    }
  };

  if (loading || !financieroData) return <LoadingSpinner />;

  const res = financieroData.resumen_ejecutivo || {};
  const desgloseFin = res.desglose_sobrecostos || {};

  // =========================================================================
  // CONFIGURACIÓN DE GRÁFICOS OPTIMIZADA (SIN SOBREPOSICIÓN DE TEXTO)
  // =========================================================================

  // Gráfica 1: Comparativa por Corredor (Barras horizontales para máxima legibilidad de nombres)
  const chartRentabilidadData = {
    labels: (financieroData.rutas || []).map((r) => r.pais_destino || r.ruta),
    datasets: [
      {
        label: 'Tarifa Facturada ($ USD)',
        backgroundColor: '#10b981',
        data: (financieroData.rutas || []).map((r) => r.tarifa_promedio_usd),
        borderRadius: 5
      },
      {
        label: 'Costo Operativo Total ($ USD)',
        backgroundColor: '#f97316',
        data: (financieroData.rutas || []).map((r) => r.costo_total_usd),
        borderRadius: 5
      }
    ]
  };

  const chartRentabilidadOptions = {
    indexAxis: 'y', // Horizontal bars prevent long country names from overlapping
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
          label: (context) => ` ${context.dataset.label}: $${context.parsed.x.toLocaleString()} USD`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-color-secondary)',
          callback: (value) => `$${value.toLocaleString()}`,
          font: { size: 11 }
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

  // Gráfica 2: Estructura de Sobrecostos Evitables (Doughnut con leyenda inferior espaciada)
  const chartCostosDoughnut = {
    labels: [
      'Multas de Documentación / DUCA',
      'Viáticos Extra por Espera en Frontera',
      'Parqueo y Almacenaje Fiscal'
    ],
    datasets: [
      {
        data: [
          desgloseFin.multas_documentacion || 0,
          desgloseFin.viaticos_extra || 0,
          desgloseFin.parqueo_almacenaje || 0
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
        hoverBackgroundColor: ['#dc2626', '#d97706', '#2563eb'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const chartDoughnutOptions = {
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
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: $${context.parsed.toLocaleString()} USD`
        }
      }
    }
  };

  // Gráfica 3: Cruce Factor Tiempo vs Factor Costo
  const chartTiempoVsCostoData = {
    labels: (financieroData.rutas || []).map((r) => r.pais_destino),
    datasets: [
      {
        type: 'bar',
        label: 'Lead Time Promedio (Horas de Tránsito)',
        backgroundColor: '#3b82f6',
        data: (financieroData.rutas || []).map((r) => r.tiempo_promedio_horas),
        yAxisID: 'y',
        borderRadius: 4
      },
      {
        type: 'line',
        label: 'Costo Operativo por Hora ($ USD/hr)',
        borderColor: '#dc2626',
        backgroundColor: '#dc2626',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.3,
        data: (financieroData.rutas || []).map((r) => r.costo_por_hora),
        yAxisID: 'y1'
      }
    ]
  };

  const chartTiempoVsCostoOptions = {
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
            if (context.dataset.type === 'line') {
              return ` ${context.dataset.label}: $${context.parsed.y}/hr`;
            }
            return ` ${context.dataset.label}: ${context.parsed.y} hrs`;
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
        ticks: { color: 'var(--text-color-secondary)' },
        grid: { color: 'rgba(160, 160, 160, 0.1)', drawBorder: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Costo por Hora ($/hr)',
          color: '#dc2626',
          font: { size: 12, weight: 'bold' }
        },
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#dc2626',
          callback: (value) => `$${value}/hr`
        }
      }
    }
  };

  return (
    <div className="dashboard-financiero-page p-4">
      {/* =========================================================================
          ENCABEZADO GERENCIAL
         ========================================================================= */}
      <div className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="m-0 text-2xl font-bold flex align-items-center gap-2">
            <i className="pi pi-dollar text-yellow-600 text-3xl"></i>
            Dashboard Financiero Gerencial
          </h1>
          <p className="text-500 m-0 mt-1">
            Rentabilidad exacta por ruta internacional cruzando el Factor Tiempo con el Factor Costo
          </p>
        </div>

        <div className="flex gap-2 flex-wrap align-items-center">
          <Button
            label="Descargar Informe Financiero (PDF)"
            icon="pi pi-file-pdf"
            severity="danger"
            loading={generatingPdf}
            className="font-bold shadow-1"
            onClick={handleExportPDF}
          />
          <Button
            label="Exportar CSV"
            icon="pi pi-file-excel"
            severity="success"
            outlined
            onClick={exportCSV}
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
          TARJETAS KPI EJECUTIVAS
         ========================================================================= */}
      <div className="grid mb-4">
        <div className="col-12 sm:col-6 md:col-3">
          <div className="p-3 shadow-2 border-round-xl surface-card border-left-3 border-blue-500 h-full flex flex-column justify-content-between">
            <span className="text-500 text-xs font-semibold uppercase block">Ingresos Totales (Facturación)</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-900 block">
                ${(res.total_ingresos_usd || 0).toLocaleString()}
              </span>
              <span className="text-xs text-500 mt-1 block">Facturación consolidada de viajes</span>
            </div>
            <span className="text-xs text-blue-600 font-semibold"><i className="pi pi-check-circle mr-1"></i>Ventas logísticas netas</span>
          </div>
        </div>

        <div className="col-12 sm:col-6 md:col-3">
          <div className="p-3 shadow-2 border-round-xl surface-card border-left-3 border-orange-500 h-full flex flex-column justify-content-between">
            <span className="text-500 text-xs font-semibold uppercase block">Costos Operativos Globales</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-orange-600 block">
                ${(res.total_costos_usd || 0).toLocaleString()}
              </span>
              <span className="text-xs text-500 mt-1 block">Flete base presupuestado + contingencias</span>
            </div>
            <span className="text-xs text-orange-700 font-semibold">Flete base: ${(res.total_flete_base_usd || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="col-12 sm:col-6 md:col-3">
          <div className="p-3 shadow-2 border-round-xl surface-card border-left-3 border-red-500 h-full flex flex-column justify-content-between">
            <span className="text-500 text-xs font-semibold uppercase block">Sobrecostos Evitables</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-red-500 block">
                ${(res.total_sobrecostos_imprevistos_usd || 0).toLocaleString()}
              </span>
              <span className="text-xs text-red-500 mt-1 block font-semibold">Multas DUCA, almacenaje y demoras</span>
            </div>
            <span className="text-xs text-red-700 font-semibold"><i className="pi pi-exclamation-triangle mr-1"></i>Fuga de capital mitigable</span>
          </div>
        </div>

        <div className="col-12 sm:col-6 md:col-3">
          <div className="p-3 shadow-2 border-round-xl surface-card border-left-3 border-green-500 h-full flex flex-column justify-content-between">
            <span className="text-500 text-xs font-semibold uppercase block">Margen Neto Global</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-green-600 block">
                {res.margen_global_pct || 0}%
              </span>
              <span className="text-xs text-green-700 mt-1 block font-semibold">
                ${(res.utilidad_neta_usd || 0).toLocaleString()} USD de utilidad neta
              </span>
            </div>
            <span className="text-xs text-green-600 font-semibold"><i className="pi pi-arrow-up-right mr-1"></i>Rentabilidad sobre ventas</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GRÁFICOS DE RENTABILIDAD & ESTRUCTURA DE SOBRECOSTOS
         ========================================================================= */}
      <div className="grid mb-4">
        <div className="col-12 lg:col-7">
          <Card className="h-full shadow-2 border-round-xl" title="Comparativa por Corredor: Tarifas Facturadas vs. Costos Operativos">
            <p className="text-500 text-xs mb-3">Barras horizontales que permiten evaluar de forma directa el margen bruto por destino</p>
            <div style={{ height: '340px' }}>
              <Chart ref={chartRentabilidadRef} type="bar" data={chartRentabilidadData} options={chartRentabilidadOptions} />
            </div>
          </Card>
        </div>

        <div className="col-12 lg:col-5">
          <Card className="h-full shadow-2 border-round-xl" title="Estructura de Sobrecostos Evitables en Tránsito">
            <p className="text-500 text-xs mb-3">Distribución de penalidades aduaneras y sobrecostos operativos no previstos</p>
            <div style={{ height: '340px' }}>
              <Chart ref={chartCostosRef} type="doughnut" data={chartCostosDoughnut} options={chartDoughnutOptions} />
            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          GRÁFICO CRÍTICO: FACTOR TIEMPO VS FACTOR COSTO
         ========================================================================= */}
      <Card
        className="shadow-2 border-round-xl mb-4 border-left-3 border-primary"
        title="Matriz de Cruce de Factores: Lead Time (Horas de Ciclo) vs. Costo Operativo por Hora ($/hr)"
      >
        <p className="text-500 text-sm mb-3">
          Permite a la gerencia identificar en qué corredores internacionales cada hora adicional de demora en aduana devalúa drásticamente la utilidad de la empresa
        </p>
        <div style={{ height: '360px' }}>
          <Chart ref={chartTiempoVsCostoRef} type="bar" data={chartTiempoVsCostoData} options={chartTiempoVsCostoOptions} />
        </div>
      </Card>

      {/* =========================================================================
          TABLA DETALLADA DE RENTABILIDAD POR RUTA INTERNACIONAL
         ========================================================================= */}
      <Card className="shadow-2 border-round-xl" title="Rentabilidad Exacta por Corredor Internacional (Desglose Completo)">
        <p className="text-500 text-sm mb-3">
          Desglose financiero unitario cruzando ingresos, costos fijos y variables con acuerdos de entrega
        </p>
        <DataTable value={financieroData.rutas} responsiveLayout="scroll">
          <Column field="ruta" header="Corredor Logístico" sortable />
          <Column field="viajes_realizados" header="Viajes" sortable />
          <Column field="tarifa_promedio_usd" header="Tarifa Facturada" body={(r) => `$${r.tarifa_promedio_usd.toLocaleString()}`} sortable />
          <Column field="flete_base_usd" header="Flete Base" body={(r) => `$${r.flete_base_usd.toLocaleString()}`} sortable />
          <Column
            field="total_sobrecostos_usd"
            header="Sobrecostos Aduana"
            body={(r) => (
              <span className="text-red-500 font-bold">
                ${r.total_sobrecostos_usd.toLocaleString()}
              </span>
            )}
            sortable
          />
          <Column field="costo_total_usd" header="Costo Total" body={(r) => `$${r.costo_total_usd.toLocaleString()}`} sortable />
          <Column field="tiempo_promedio_horas" header="Lead Time" body={(r) => `${r.tiempo_promedio_horas} hrs`} sortable />
          <Column
            field="costo_por_hora"
            header="Costo / Hora"
            body={(r) => <span className="font-semibold text-blue-700">${r.costo_por_hora}/hr</span>}
            sortable
          />
          <Column
            field="margen_pct"
            header="Margen Neto"
            sortable
            body={(r) => (
              <Tag
                severity={r.margen_pct >= 30 ? 'success' : (r.margen_pct >= 20 ? 'info' : 'warning')}
                value={`${r.margen_pct}% ($${r.margen_usd.toLocaleString()})`}
                className="font-bold"
              />
            )}
          />
          <Column
            field="entregas_a_tiempo_pct"
            header="SLA On-Time"
            sortable
            body={(r) => `${r.entregas_a_tiempo_pct}%`}
          />
        </DataTable>
      </Card>
    </div>
  );
}
