import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { getDashboardKpis } from '../../api/reportsApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DashboardPage() {
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
      showError('Error al cargar métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Vista exclusiva para piloto (solo el logo y bienvenida)
  if (user?.role === ROLES.LEVEL_3) {
    return (
      <div className="flex flex-column align-items-center justify-content-center fadein animation-duration-500" style={{ minHeight: '80vh' }}>
        <img src={new URL('../../assets/lojo.jpg', import.meta.url).href} alt="GlobalTrans Logo" style={{ width: '250px', borderRadius: '1px' }} />
        <h1 className="mt-5 text-4xl text-primary font-bold">GlobalTrans</h1>
        <p className="text-xl text-600">Sistema de Gestión Logística</p>
      </div>
    );
  }

  if (!kpis) return <LoadingSpinner />;

  // Datos reales obtenidos del backend
  const chartData = {
    labels: kpis.chart_data?.labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Entregas a Tiempo',
        backgroundColor: '#10b981',
        data: kpis.chart_data?.entregas || [0, 0, 0, 0, 0, 0, 0],
        borderRadius: 4
      },
      {
        label: 'Retrasos/Incidentes',
        backgroundColor: '#ef4444',
        data: kpis.chart_data?.retrasos || [0, 0, 0, 0, 0, 0, 0],
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-color)',
          font: { family: 'inherit', size: 13 },
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color-secondary)' },
        grid: { display: false, drawBorder: false }
      },
      y: {
        ticks: { color: 'var(--text-color-secondary)', precision: 0 },
        grid: { display: false, drawBorder: false },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="dashboard-page p-4 md:p-6 fadein animation-duration-500">

      {/* Hero Banner Profesional */}
      <div className="mb-5 p-5 border-round-2xl shadow-4 flex flex-column md:flex-row justify-content-between align-items-center bg-primary" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%)' }}>
        <div>
          <h1 className="text-3xl md:text-4xl m-0 text-white font-bold mb-2">Panel de Control GlobalTrans</h1>
          <p className="m-0 text-primary-100 text-lg">Resumen de operaciones logísticas en tiempo real. ¡Hola, {user?.full_name?.split(' ')[0] || 'Administrador'}!</p>
        </div>
        <div className="mt-4 md:mt-0 flex align-items-center bg-white-alpha-20 p-3 border-round-xl">
          <i className="pi pi-calendar text-white text-3xl mr-3"></i>
          <div>
            <div className="text-white font-medium text-sm uppercase">Fecha Actual</div>
            <div className="text-white font-bold text-xl">{new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
          </div>
        </div>
      </div>

      {/* KPI Widgets Premium */}
      <div className="grid mb-4">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-4 transition-all transition-duration-300 border-round-xl" style={{ borderBottom: '4px solid var(--blue-500)' }}>
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="block text-500 font-semibold mb-2 uppercase text-sm">Viajes Activos</span>
                <div className="text-900 font-bold text-5xl mb-2">{kpis.activos}</div>
                <span className="text-blue-500 font-medium"><i className="pi pi-arrow-up mr-1"></i>En ruta o aduana</span>
              </div>
              <div className="flex align-items-center justify-content-center bg-blue-100 border-circle" style={{ width: '4rem', height: '4rem' }}>
                <i className="pi pi-truck text-blue-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-4 transition-all transition-duration-300 border-round-xl" style={{ borderBottom: '4px solid var(--green-500)' }}>
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="block text-500 font-semibold mb-2 uppercase text-sm">Total Entregados</span>
                <div className="text-900 font-bold text-5xl mb-2">{kpis.entregados}</div>
                <span className="text-green-500 font-medium"><i className="pi pi-check mr-1"></i>Completados con éxito</span>
              </div>
              <div className="flex align-items-center justify-content-center bg-green-100 border-circle" style={{ width: '4rem', height: '4rem' }}>
                <i className="pi pi-check-circle text-green-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-4 transition-all transition-duration-300 border-round-xl" style={{ borderBottom: '4px solid var(--red-500)' }}>
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="block text-500 font-semibold mb-2 uppercase text-sm">Incidentes / Retrasos</span>
                <div className="text-900 font-bold text-5xl mb-2">{kpis.retrasados}</div>
                <span className="text-red-500 font-medium"><i className="pi pi-exclamation-triangle mr-1"></i>Requieren atención</span>
              </div>
              <div className="flex align-items-center justify-content-center bg-red-100 border-circle" style={{ width: '4rem', height: '4rem' }}>
                <i className="pi pi-bell text-red-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="h-full shadow-2 hover:shadow-4 transition-all transition-duration-300 border-round-xl" style={{ borderBottom: '4px solid var(--purple-500)' }}>
            <div className="flex justify-content-between align-items-start">
              <div>
                <span className="block text-500 font-semibold mb-2 uppercase text-sm">Tiempo Promedio</span>
                <div className="text-900 font-bold text-5xl mb-2">{kpis.tiempo_promedio_horas}</div>
                <span className="text-purple-500 font-medium">Horas por trayecto</span>
              </div>
              <div className="flex align-items-center justify-content-center bg-purple-100 border-circle" style={{ width: '4rem', height: '4rem' }}>
                <i className="pi pi-clock text-purple-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráficos y Tablas Adicionales */}
      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card title="Rendimiento de Entregas (Últimos 7 Días)" className="h-full shadow-2 border-round-xl">
            <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '350px' }} />
          </Card>
        </div>
        <div className="col-12 lg:col-4">
          <Card title="Accesos Rápidos" className="h-full shadow-2 border-round-xl">
            <div className="flex flex-column gap-3 mt-3">
              <div className="p-3 bg-black-alpha-10 border-round-lg flex align-items-center justify-content-between cursor-pointer hover:surface-hover transition-colors">
                <div className="flex align-items-center gap-3">
                  <div className="bg-blue-100 p-2 border-circle"><i className="pi pi-map text-blue-500 text-xl"></i></div>
                  <span className="font-bold text-900">Ver Mapa Global</span>
                </div>
                <i className="pi pi-angle-right text-500"></i>
              </div>

              <div className="p-3 bg-black-alpha-10 border-round-lg flex align-items-center justify-content-between cursor-pointer hover:surface-hover transition-colors">
                <div className="flex align-items-center gap-3">
                  <div className="bg-green-100 p-2 border-circle"><i className="pi pi-box text-green-500 text-xl"></i></div>
                  <span className="font-bold text-900">Gestionar Cargamentos</span>
                </div>
                <i className="pi pi-angle-right text-500"></i>
              </div>

              <div className="p-3 bg-black-alpha-10 border-round-lg flex align-items-center justify-content-between cursor-pointer hover:surface-hover transition-colors">
                <div className="flex align-items-center gap-3">
                  <div className="bg-purple-100 p-2 border-circle"><i className="pi pi-chart-line text-purple-500 text-xl"></i></div>
                  <span className="font-bold text-900">Reportes de Auditoría</span>
                </div>
                <i className="pi pi-angle-right text-500"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
