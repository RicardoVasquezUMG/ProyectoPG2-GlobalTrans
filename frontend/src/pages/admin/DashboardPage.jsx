import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getDashboardKpis } from '../../api/reportsApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    if (user?.role !== ROLES.LEVEL_3) {
      loadData();
    } else {
      setLoading(false); // No data to load for pilot
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardKpis();
      setKpis(data);
    } catch (error) {
      showError('Error al cargar métricas del centro de mando');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Vista exclusiva para piloto (Nivel 3)
  if (user?.role === ROLES.LEVEL_3) {
    return (
      <div className="flex flex-column align-items-center justify-content-center fadein animation-duration-500" style={{ minHeight: '80vh' }}>
        <img src={new URL('../../assets/lojo.jpg', import.meta.url).href} alt="GlobalTrans Logo" style={{ width: '250px', borderRadius: '1px' }} />
        <h1 className="mt-5 text-4xl text-primary font-bold">GlobalTrans</h1>
        <p className="text-xl text-600">Sistema de Gestión Logística</p>
        <Button
          label="Ir a Mis Viajes Asignados"
          icon="pi pi-compass"
          className="mt-4 font-bold"
          onClick={() => navigate('/mis-viajes')}
        />
      </div>
    );
  }

  if (!kpis) return <LoadingSpinner />;

  const fin = kpis.finanzas || {};
  const temp = kpis.temporada || {};
  const topCorredores = kpis.top_corredores || [];

  // =========================================================================
  // CONFIGURACIÓN DE GRÁFICOS (SIN SOLAPAMIENTO DE TEXTO NI ETIQUETAS)
  // =========================================================================

  // Gráfica 1: Operaciones Semanales (Entregas On-Time vs Retrasos)
  const chartOperativoData = {
    labels: kpis.chart_data?.labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Entregas a Tiempo (SLA)',
        backgroundColor: '#10b981',
        data: kpis.chart_data?.entregas || [0, 0, 0, 0, 0, 0, 0],
        borderRadius: 4
      },
      {
        label: 'Retrasos / Incidentes',
        backgroundColor: '#ef4444',
        data: kpis.chart_data?.retrasos || [0, 0, 0, 0, 0, 0, 0],
        borderRadius: 4
      }
    ]
  };

  const chartOperativoOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y} viajes`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color-secondary)', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: 'var(--text-color-secondary)', precision: 0 },
        grid: { color: 'rgba(160, 160, 160, 0.1)', drawBorder: false },
        beginAtZero: true
      }
    }
  };

  // Gráfica 2: Comparativa Financiera por Corredor Internacional (Barras Horizontales)
  const chartFinancieroData = {
    labels: topCorredores.map((c) => c.pais_destino || c.ruta),
    datasets: [
      {
        label: 'Tarifa Facturada ($ USD)',
        backgroundColor: '#10b981',
        data: topCorredores.map((c) => c.tarifa_promedio_usd || 0),
        borderRadius: 4
      },
      {
        label: 'Costo Operativo ($ USD)',
        backgroundColor: '#f97316',
        data: topCorredores.map((c) => c.costo_total_usd || 0),
        borderRadius: 4
      }
    ]
  };

  const chartFinancieroOptions = {
    indexAxis: 'y', // Barras horizontales: elimina completamente el solapamiento de nombres de países
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 16
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

  return (
    <div className="dashboard-page p-3 md:p-5 fadein animation-duration-500">
      {/* =========================================================================
          HERO BANNER PRINCIPAL CON FECHA Y PERFIL
         ========================================================================= */}
      <div
        className="mb-4 p-4 md:p-5 border-round-2xl shadow-3 flex flex-column md:flex-row justify-content-between align-items-center gap-3 text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)' }}
      >
        <div>
          <div className="flex align-items-center gap-2 mb-2">
            <span className="bg-white-alpha-20 text-white text-xs px-2 py-1 border-round uppercase font-semibold tracking-wider">
              Centro de Mando Ejecutivo
            </span>
            <span className="text-white-alpha-70 text-xs">Versión Integral 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl m-0 font-bold">
            Panel Estratégico GlobalTrans
          </h1>
          <p className="m-0 mt-1 text-blue-100 text-sm md:text-base">
            Control de flota internacional, anticipación estacional y salud financiera de viajes. ¡Bienvenido, {user?.full_name || 'Administrador'}!
          </p>
        </div>

        <div className="flex align-items-center gap-3 bg-white-alpha-10 px-4 py-3 border-round-xl w-full md:w-auto justify-content-between md:justify-content-start">
          <i className="pi pi-calendar text-2xl text-cyan-200"></i>
          <div>
            <div className="text-xs uppercase text-blue-200 font-semibold">Fecha de Operación</div>
            <div className="text-base font-bold text-white capitalize">
              {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BANNER DE ALERTA ESTACIONAL (VENTAS POR CATÁLOGO & ADUANAS)
         ========================================================================= */}
      {temp.temporada && (
        <div
          className={`p-3 md:p-4 mb-4 border-round-xl shadow-2 flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3 border-left-3 ${
            temp.es_temporada_alta ? 'border-red-500 bg-red-50 text-red-900' : 'border-blue-500 bg-blue-50 text-blue-900'
          }`}
        >
          <div className="flex align-items-center gap-3">
            <div
              className={`p-3 border-circle flex align-items-center justify-content-center ${
                temp.es_temporada_alta ? 'bg-red-200 text-red-700' : 'bg-blue-200 text-blue-700'
              }`}
              style={{ width: '3rem', height: '3rem' }}
            >
              <i className={`pi ${temp.es_temporada_alta ? 'pi-exclamation-circle' : 'pi-info-circle'} text-xl`}></i>
            </div>
            <div>
              <div className="flex align-items-center gap-2 flex-wrap">
                <span className="font-bold text-base md:text-lg">{temp.temporada}</span>
                <Tag
                  severity={temp.es_temporada_alta ? 'danger' : 'info'}
                  value={temp.es_temporada_alta ? `TEMPORADA ALTA (x${temp.factor_demora} demora)` : 'TEMPORADA REGULAR'}
                />
              </div>
              <p className="m-0 mt-1 text-xs md:text-sm text-700">
                {temp.motivo_estacional}
              </p>
            </div>
          </div>

          <Button
            label="Ver Rutas Alternas Sugeridas"
            icon="pi pi-compass"
            size="small"
            severity={temp.es_temporada_alta ? 'danger' : 'info'}
            className="font-bold flex-shrink-0"
            onClick={() => navigate('/auditoria')}
          />
        </div>
      )}

      {/* =========================================================================
          BLOQUE 1: KPIS OPERATIVOS & DE SERVICIO (SLA)
         ========================================================================= */}
      <div className="mb-2 flex align-items-center justify-content-between">
        <h2 className="text-lg font-bold text-900 m-0 flex align-items-center gap-2">
          <i className="pi pi-truck text-blue-500"></i>
          Métricas de Flota & Cumplimiento Logístico
        </h2>
        <span className="text-xs text-500">Actualizado en tiempo real</span>
      </div>

      <div className="grid mb-4">
        {/* KPI 1: Viajes Activos */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-3 transition-all border-round-xl border-left-3 border-blue-500">
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="text-500 font-semibold uppercase text-xs block mb-1">Viajes Activos</span>
                <div className="text-3xl font-extrabold text-900 mb-1">{kpis.activos}</div>
                <span className="text-blue-600 text-xs font-semibold">
                  <i className="pi pi-arrow-right mr-1"></i>En ruta / paso aduanero
                </span>
              </div>
              <div className="bg-blue-100 p-3 border-circle">
                <i className="pi pi-compass text-blue-600 text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* KPI 2: Total Entregados */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-3 transition-all border-round-xl border-left-3 border-green-500">
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="text-500 font-semibold uppercase text-xs block mb-1">Total Entregados</span>
                <div className="text-3xl font-extrabold text-900 mb-1">{kpis.entregados}</div>
                <span className="text-green-600 text-xs font-semibold">
                  <i className="pi pi-check mr-1"></i>Finalizados con éxito
                </span>
              </div>
              <div className="bg-green-100 p-3 border-circle">
                <i className="pi pi-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* KPI 3: Incidentes / Retrasos */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-3 transition-all border-round-xl border-left-3 border-red-500">
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="text-500 font-semibold uppercase text-xs block mb-1">Incidentes / Retrasos</span>
                <div className="text-3xl font-extrabold text-900 mb-1">{kpis.retrasados}</div>
                <span className="text-red-500 text-xs font-semibold">
                  <i className="pi pi-exclamation-triangle mr-1"></i>Requieren intervención
                </span>
              </div>
              <div className="bg-red-100 p-3 border-circle">
                <i className="pi pi-bell text-red-500 text-xl"></i>
              </div>
            </div>
          </Card>
        </div>

        {/* KPI 4: Nivel de Servicio On-Time SLA */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-3 transition-all border-round-xl border-left-3 border-teal-500">
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="text-500 font-semibold uppercase text-xs block mb-1">Cumplimiento On-Time (SLA)</span>
                <div className="text-3xl font-extrabold text-teal-700 mb-1">{kpis.sla_cumplimiento_pct}%</div>
                <ProgressBar
                  value={kpis.sla_cumplimiento_pct}
                  color={kpis.sla_cumplimiento_pct >= 85 ? 'var(--green-500)' : 'var(--orange-500)'}
                  displayValueTemplate={() => <></>}
                  style={{ height: '6px', width: '130px', marginTop: '6px' }}
                />
              </div>
              <div className="bg-teal-100 p-3 border-circle">
                <i className="pi pi-shield text-teal-600 text-xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 2: KPIS FINANCIEROS EJECUTIVOS
         ========================================================================= */}
      <div className="mb-2 flex align-items-center justify-content-between">
        <h2 className="text-lg font-bold text-900 m-0 flex align-items-center gap-2">
          <i className="pi pi-dollar text-yellow-600"></i>
          Resumen Financiero & Control de Sobrecostos
        </h2>
        <Button
          label="Ir al Detalle Financiero"
          icon="pi pi-arrow-up-right"
          className="p-button-text p-button-sm p-0 font-bold text-primary"
          onClick={() => navigate('/dashboard-financiero')}
        />
      </div>

      <div className="grid mb-4">
        {/* KPI 5: Facturación Total */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 border-round-xl bg-surface-card border-left-3 border-green-500">
            <span className="text-500 font-semibold uppercase text-xs block mb-1">Facturación Total Proyectada</span>
            <div className="text-2xl font-black text-green-700 mb-1">
              ${Number(fin.total_ingresos_usd || 0).toLocaleString()} <span className="text-xs text-500 font-normal">USD</span>
            </div>
            <span className="text-xs text-500">Tarifas contratadas en flete</span>
          </Card>
        </div>

        {/* KPI 6: Costos Operativos Totales */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 border-round-xl bg-surface-card border-left-3 border-orange-500">
            <span className="text-500 font-semibold uppercase text-xs block mb-1">Costo Operativo Total</span>
            <div className="text-2xl font-black text-orange-700 mb-1">
              ${Number(fin.total_costos_usd || 0).toLocaleString()} <span className="text-xs text-500 font-normal">USD</span>
            </div>
            <span className="text-xs text-500">Flete base + viáticos + peajes</span>
          </Card>
        </div>

        {/* KPI 7: Sobrecostos Evitables */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 border-round-xl bg-surface-card border-left-3 border-red-500">
            <span className="text-500 font-semibold uppercase text-xs block mb-1">Sobrecostos Evitables</span>
            <div className="text-2xl font-black text-red-600 mb-1">
              ${Number(fin.total_sobrecostos_imprevistos_usd || 0).toLocaleString()} <span className="text-xs text-500 font-normal">USD</span>
            </div>
            <span className="text-xs text-red-500 font-semibold">Multas DUCA, espera en frontera</span>
          </Card>
        </div>

        {/* KPI 8: Margen Neto Promedio */}
        <div className="col-12 sm:col-6 lg:col-3">
          <Card className="h-full shadow-2 border-round-xl bg-surface-card border-left-3 border-purple-500">
            <span className="text-500 font-semibold uppercase text-xs block mb-1">Margen Neto Global</span>
            <div className="text-2xl font-black text-purple-700 mb-1">
              {fin.margen_global_pct || 0}%
            </div>
            <span className="text-xs text-green-600 font-semibold">
              <i className="pi pi-wallet mr-1"></i>${Number(fin.utilidad_neta_usd || 0).toLocaleString()} USD ganancia
            </span>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 3: GRÁFICAS EJECUTIVAS SIN TRASLAPES NI SOLAPAMIENTO
         ========================================================================= */}
      <div className="grid mb-4">
        {/* Gráfico 1: Rendimiento Semanal */}
        <div className="col-12 lg:col-6">
          <Card
            title="Flujo Operativo de Envíos (Últimos 7 Días)"
            subTitle="Entregas a tiempo vs. incidencias registradas en tránsito"
            className="h-full shadow-2 border-round-xl"
          >
            <div style={{ height: '320px' }}>
              <Chart type="bar" data={chartOperativoData} options={chartOperativoOptions} />
            </div>
          </Card>
        </div>

        {/* Gráfico 2: Comparativa Financiera por Corredor */}
        <div className="col-12 lg:col-6">
          <Card
            title="Rentabilidad por Corredor Internacional"
            subTitle="Ingresos facturados vs. Costos totales (Barras horizontales para máxima legibilidad)"
            className="h-full shadow-2 border-round-xl"
          >
            <div style={{ height: '320px' }}>
              <Chart type="bar" data={chartFinancieroData} options={chartFinancieroOptions} />
            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 4: TABLA DE TOP CORREDORES & ACCESOS RÁPIDOS
         ========================================================================= */}
      <div className="grid">
        {/* Tabla de Corredores Principales */}
        <div className="col-12 lg:col-8">
          <Card
            title="Desempeño por Corredor Logístico Centroamericano"
            subTitle="Evaluación ejecutiva de volumen, costos y nivel de servicio"
            className="h-full shadow-2 border-round-xl"
          >
            <DataTable value={topCorredores} responsiveLayout="scroll" emptyMessage="No hay datos de rutas registrados.">
              <Column
                field="ruta"
                header="Corredor Logístico"
                sortable
                body={(r) => (
                  <div>
                    <span className="font-bold block text-900">{r.ruta}</span>
                    <span className="text-xs text-500">Destino: {r.pais_destino}</span>
                  </div>
                )}
              />
              <Column field="viajes_realizados" header="Viajes" sortable />
              <Column
                field="tiempo_promedio_horas"
                header="Lead Time"
                sortable
                body={(r) => `${r.tiempo_promedio_horas} hrs`}
              />
              <Column
                field="total_sobrecostos_usd"
                header="Sobrecostos"
                sortable
                body={(r) => (
                  <span className={`font-bold ${r.total_sobrecostos_usd > 200 ? 'text-red-500' : 'text-700'}`}>
                    ${r.total_sobrecostos_usd} USD
                  </span>
                )}
              />
              <Column
                field="margen_pct"
                header="Margen Neto"
                sortable
                body={(r) => (
                  <Tag
                    severity={r.margen_pct >= 35 ? 'success' : r.margen_pct >= 20 ? 'warning' : 'danger'}
                    value={`${r.margen_pct}%`}
                  />
                )}
              />
              <Column
                field="entregas_a_tiempo_pct"
                header="SLA On-Time"
                sortable
                body={(r) => (
                  <span className="font-bold text-teal-700">
                    {r.entregas_a_tiempo_pct}%
                  </span>
                )}
              />
            </DataTable>
          </Card>
        </div>

        {/* Accesos Rápidos Estratégicos */}
        <div className="col-12 lg:col-4">
          <Card title="Módulos de Gestión Estratégica" className="h-full shadow-2 border-round-xl">
            <div className="flex flex-column gap-3 mt-2">
              <div
                onClick={() => navigate('/dashboard-financiero')}
                className="p-3 bg-surface-100 hover:surface-200 border-round-xl flex align-items-center justify-content-between cursor-pointer transition-colors shadow-1"
              >
                <div className="flex align-items-center gap-3">
                  <div className="bg-yellow-100 p-3 border-circle">
                    <i className="pi pi-dollar text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <span className="font-bold text-900 block">Dashboard Financiero</span>
                    <span className="text-xs text-500">Cruce tiempo vs costo & PDF</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-500"></i>
              </div>

              <div
                onClick={() => navigate('/auditoria')}
                className="p-3 bg-surface-100 hover:surface-200 border-round-xl flex align-items-center justify-content-between cursor-pointer transition-colors shadow-1"
              >
                <div className="flex align-items-center gap-3">
                  <div className="bg-purple-100 p-3 border-circle">
                    <i className="pi pi-shield text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <span className="font-bold text-900 block">Auditoría & Rutas IA</span>
                    <span className="text-xs text-500">Predicción estacional aduanera</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-500"></i>
              </div>

              <div
                onClick={() => navigate('/viajes')}
                className="p-3 bg-surface-100 hover:surface-200 border-round-xl flex align-items-center justify-content-between cursor-pointer transition-colors shadow-1"
              >
                <div className="flex align-items-center gap-3">
                  <div className="bg-green-100 p-3 border-circle">
                    <i className="pi pi-wallet text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <span className="font-bold text-900 block">Liquidación de Costos</span>
                    <span className="text-xs text-500">Flete base & sobrecostos de viaje</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-500"></i>
              </div>

              <div
                onClick={() => navigate('/monitoreo')}
                className="p-3 bg-surface-100 hover:surface-200 border-round-xl flex align-items-center justify-content-between cursor-pointer transition-colors shadow-1"
              >
                <div className="flex align-items-center gap-3">
                  <div className="bg-blue-100 p-3 border-circle">
                    <i className="pi pi-map text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <span className="font-bold text-900 block">Monitoreo GPS Global</span>
                    <span className="text-xs text-500">Trazabilidad en mapa en vivo</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-500"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
