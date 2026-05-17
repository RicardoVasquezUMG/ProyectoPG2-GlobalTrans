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
    <div className="mis-viajes-page fadein animation-duration-500 p-2 md:p-3">
      
      <div className="pilot-hero mb-3 p-3 border-round-xl shadow-4 flex flex-column md:flex-row justify-content-between align-items-center bg-primary">
        <div>
          <h1 className="text-2xl m-0 text-white font-bold mb-1">¡Hola, {user.full_name.split(' ')[0]}!</h1>
          <p className="m-0 text-primary-100 text-base">Tienes {viajes.length} {viajes.length === 1 ? 'viaje activo' : 'viajes activos'}.</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
           <div className="bg-white text-primary text-center p-2 border-round-lg shadow-2">
             <div className="text-2xl font-bold">{viajes.filter(v => v.estado === ESTADOS_VIAJE.PLANIFICADO).length}</div>
             <div className="text-xs uppercase font-semibold">Planificados</div>
           </div>
           <div className="bg-white text-primary text-center p-2 border-round-lg shadow-2">
             <div className="text-2xl font-bold">{viajes.filter(v => v.estado !== ESTADOS_VIAJE.PLANIFICADO).length}</div>
             <div className="text-xs uppercase font-semibold">En Curso</div>
           </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2 text-color">Rutas Asignadas</h2>

      <div className="grid">
        {viajes.length === 0 ? (
          <div className="col-12">
            <div className="no-viajes-msg p-4 text-center border-round-xl surface-card shadow-1">
              <div className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle p-3 mb-3">
                <i className="pi pi-check-circle text-blue-500" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h3 className="text-xl font-bold mb-1">Todo al día</h3>
              <p className="text-color-secondary text-base">No tienes viajes activos asignados en este momento.</p>
            </div>
          </div>
        ) : (
          viajes.map((viaje) => (
            <div className="col-12 md:col-6 lg:col-4" key={viaje.id}>
              <Card className="viaje-card h-full flex flex-column justify-content-between shadow-2 hover:shadow-4 transition-all transition-duration-300">
                <div>
                  <div className="flex justify-content-between align-items-start mb-2">
                    <div className="flex align-items-center gap-2">
                      <div className="bg-primary-50 p-2 border-circle">
                        <i className="pi pi-map-marker text-primary text-lg"></i>
                      </div>
                      <span className="text-lg font-bold text-900 line-height-2">{viaje.nombre_tienda} <br/><small className="text-500 font-normal">{viaje.pais_destino || ''}</small></span>
                    </div>
                    <Tag severity={getStatusSeverity(viaje.estado)} value={getStatusLabel(viaje.estado)} className="px-2 py-1 font-bold shadow-1" />
                  </div>
                  
                  <div className="viaje-details mb-3 mt-2 bg-black-alpha-10 p-2 border-round-lg">
                    <div className="flex align-items-center mb-2">
                      <i className="pi pi-box mr-2 text-lg text-primary"></i>
                      <div>
                        <span className="block text-xs text-500 font-semibold mb-1">Contenedor</span>
                        <span className="block text-900 font-medium text-sm">{viaje.numero_contenedor || 'No asignado'}</span>
                      </div>
                    </div>
                    <div className="flex align-items-center mb-2">
                      <i className="pi pi-truck mr-2 text-lg text-primary"></i>
                      <div>
                        <span className="block text-xs text-500 font-semibold mb-1">Vehículo</span>
                        <span className="block text-900 font-medium text-sm">{viaje.placa_vehiculo || 'No asignado'}</span>
                      </div>
                    </div>
                    <div className="flex align-items-center">
                      <i className="pi pi-calendar mr-2 text-lg text-primary"></i>
                      <div>
                        <span className="block text-xs text-500 font-semibold mb-1">Salida Planificada</span>
                        <span className="block text-900 font-medium text-sm">{new Date(viaje.fecha_plan_salida).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short'})}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  label={viaje.estado === ESTADOS_VIAJE.PLANIFICADO ? 'Iniciar Viaje' : 'Continuar Navegación'} 
                  icon={viaje.estado === ESTADOS_VIAJE.PLANIFICADO ? 'pi pi-play' : 'pi pi-map'} 
                  className={`w-full border-round-lg shadow-2 font-bold p-button-sm ${viaje.estado === ESTADOS_VIAJE.PLANIFICADO ? 'p-button-primary' : 'p-button-success'}`}
                  onClick={() => handleStartTrip(viaje.id)} 
                />
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
