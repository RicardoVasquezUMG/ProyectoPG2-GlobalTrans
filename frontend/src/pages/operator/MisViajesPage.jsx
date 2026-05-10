import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getViajes } from '../../api/viajesApi';
import { ESTADOS_VIAJE } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './MisViajesPage.css';

export default function MisViajesPage() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadViajes();
  }, []);

  const loadViajes = async () => {
    try {
      setLoading(true);
      // Fetch only pilot's trips
      const data = await getViajes(user.id);
      
      // Filter out delivered or cancelled trips unless we want to show history. 
      // For now, let's show only active/planned ones for navigation.
      const activeTrips = data.filter(v => 
        [ESTADOS_VIAJE.PLANIFICADO, ESTADOS_VIAJE.EN_RUTA, ESTADOS_VIAJE.EN_ADUANA, ESTADOS_VIAJE.RETRASADO].includes(v.estado)
      );
      setViajes(activeTrips);
    } catch (error) {
      showError('Error al cargar tus viajes asignados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (estado) => {
    switch (estado) {
      case ESTADOS_VIAJE.PLANIFICADO: return 'info';
      case ESTADOS_VIAJE.EN_RUTA: return 'success';
      case ESTADOS_VIAJE.EN_ADUANA: return 'warning';
      case ESTADOS_VIAJE.RETRASADO: return 'danger';
      default: return 'info';
    }
  };

  const getStatusLabel = (estado) => {
    return estado.replace('_', ' ').toUpperCase();
  };

  const handleStartTrip = (viajeId) => {
    navigate(`/pilot/navegacion/${viajeId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mis-viajes-page p-4">
      <div className="page-header mb-4">
        <h1>Mis Viajes Asignados</h1>
        <p className="text-secondary">Selecciona un viaje para iniciar la ruta</p>
      </div>

      <div className="viajes-grid">
        {viajes.length === 0 ? (
          <div className="no-viajes-msg">
            <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: 'var(--text-color-secondary)' }}></i>
            <h3>No tienes viajes activos</h3>
            <p>Se te notificará cuando se te asigne un nuevo cargamento.</p>
          </div>
        ) : (
          viajes.map((viaje) => (
            <Card key={viaje.id} className="viaje-card mb-4">
              <div className="viaje-card-header flex justify-content-between align-items-center mb-3">
                <span className="text-xl font-bold">Destino: {viaje.pais_destino || viaje.nombre_tienda}</span>
                <Tag severity={getStatusSeverity(viaje.estado)} value={getStatusLabel(viaje.estado)} />
              </div>
              
              <div className="viaje-details mb-4">
                <div className="detail-item mb-2">
                  <i className="pi pi-box mr-2"></i>
                  <span>Contenedor: <strong>{viaje.numero_contenedor || 'N/A'}</strong></span>
                </div>
                <div className="detail-item mb-2">
                  <i className="pi pi-calendar mr-2"></i>
                  <span>Salida Planificada: {new Date(viaje.fecha_plan_salida).toLocaleString()}</span>
                </div>
                <div className="detail-item mb-2">
                  <i className="pi pi-shop mr-2"></i>
                  <span>Tienda: {viaje.nombre_tienda}</span>
                </div>
              </div>

              <Button 
                label={viaje.estado === ESTADOS_VIAJE.PLANIFICADO ? 'Iniciar Viaje' : 'Continuar Viaje'} 
                icon="pi pi-map" 
                size="large"
                className="w-full p-button-lg start-btn" 
                severity={viaje.estado === ESTADOS_VIAJE.PLANIFICADO ? 'primary' : 'success'}
                onClick={() => handleStartTrip(viaje.id)} 
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
