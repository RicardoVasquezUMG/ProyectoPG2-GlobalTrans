import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { getDashboardKpis } from '../../api/reportsApi';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

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

  // Datos simulados para el gráfico basados en los KPIs
  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Entregas a Tiempo',
        backgroundColor: '#10b981',
        data: [2, 5, 3, kpis?.entregados || 0, 0, 0, 0]
      },
      {
        label: 'Retrasos',
        backgroundColor: '#ef4444',
        data: [0, 1, 0, kpis?.retrasados || 0, 0, 0, 0]
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-color)'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-color-secondary)' },
        grid: { color: 'var(--surface-border)' }
      },
      y: {
        ticks: { color: 'var(--text-color-secondary)' },
        grid: { color: 'var(--surface-border)' }
      }
    }
  };

  return (
    <div className="dashboard-page p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1>Dashboard GlobalTrans</h1>
      </div>

      {/* KPI Widgets */}
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="mb-3 shadow-2 border-round-xl h-full" style={{ borderLeft: '4px solid var(--blue-500)' }}>
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-3">Viajes Activos</span>
                <div className="text-900 font-bold text-4xl">{kpis?.activos || 0}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                <i className="pi pi-truck text-blue-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="mb-3 shadow-2 border-round-xl h-full" style={{ borderLeft: '4px solid var(--green-500)' }}>
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-3">Entregados</span>
                <div className="text-900 font-bold text-4xl">{kpis?.entregados || 0}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                <i className="pi pi-check-circle text-green-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="mb-3 shadow-2 border-round-xl h-full" style={{ borderLeft: '4px solid var(--red-500)' }}>
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-3">Alertas de Retraso</span>
                <div className="text-900 font-bold text-4xl">{kpis?.retrasados || 0}</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="mb-3 shadow-2 border-round-xl h-full" style={{ borderLeft: '4px solid var(--purple-500)' }}>
            <div className="flex justify-content-between">
              <div>
                <span className="block text-500 font-medium mb-3">T. Tránsito Promedio</span>
                <div className="text-900 font-bold text-4xl">{kpis?.tiempo_promedio_horas || 0} hrs</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                <i className="pi pi-clock text-purple-500 text-2xl"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid mt-4">
        <div className="col-12">
          <Card title="Rendimiento de Entregas (Semanal)" className="shadow-2 border-round-xl">
            <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '300px' }} />
          </Card>
        </div>
      </div>
    </div>
  );
}
