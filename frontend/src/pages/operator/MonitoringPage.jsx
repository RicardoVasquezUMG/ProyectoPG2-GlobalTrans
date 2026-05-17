import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { obtenerViajesActivos } from '../../api/trackingApi';
import { useToast } from '../../hooks/useToast';
import { Tag } from 'primereact/tag';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Iconos
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/12781/12781217.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const alertIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/7279/7279860.png', // Red truck / alert
  iconSize: [45, 45],
  iconAnchor: [22, 22],
});

export default function MonitoringPage() {
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const mapRef = useRef(null);

  useEffect(() => {
    loadTrips();

    // Polling cada 15 segundos
    const interval = setInterval(() => {
      loadTrips(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadTrips = async (showLoad = true) => {
    try {
      if (showLoad) setLoading(true);
      const data = await obtenerViajesActivos();
      // Evaluar retrasos locales para no recargar la API
      const now = new Date();
      const processed = data.map(t => {
        let isDelayed = false;
        if (t.estado === 'retrasado') isDelayed = true;
        // Check if ETA has passed (assuming it's returned by getActiveTrips, or we simulate)
        return { ...t, isDelayed };
      });
      setActiveTrips(processed);
    } catch (error) {
      if (showLoad) showError('Error al cargar posiciones');
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  const focusMapOn = (lat, lng) => {
    if (mapRef.current && lat && lng) {
      mapRef.current.setView([lat, lng], 13, { animate: true });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="monitoring-page p-4 h-screen flex flex-column">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1>Monitoreo en Tiempo Real</h1>
        <div className="flex gap-3">
          <div className="flex align-items-center"><span className="w-1rem h-1rem bg-blue-500 border-circle mr-2"></span> En Ruta / Normal</div>
          <div className="flex align-items-center"><span className="w-1rem h-1rem bg-red-500 border-circle mr-2"></span> Retraso / Alerta</div>
        </div>
      </div>

      <div className="grid flex-grow-1 min-h-0">
        {/* Lista Lateral */}
        <div className="col-12 md:col-3 h-full overflow-y-auto pr-3">
          {activeTrips.length === 0 ? (
            <Card className="text-center">
              <p>No hay furgones activos en este momento.</p>
            </Card>
          ) : (
            activeTrips.map(trip => (
              <Card
                key={trip.id}
                className={`mb-3 cursor-pointer shadow-2 border-round-xl transition-all hover:shadow-4 ${trip.isDelayed ? 'border-red-500 border-2' : 'border-blue-500 border-1'}`}
                onClick={() => focusMapOn(trip.latitud, trip.longitud)}
              >
                <div className="flex justify-content-between align-items-center mb-2">
                  <span className="font-bold text-lg">{trip.placa_vehiculo}</span>
                  <Tag severity={trip.isDelayed ? 'danger' : 'success'} value={trip.isDelayed ? 'RETRASO' : 'EN RUTA'}></Tag>
                </div>
                <p className="m-0 text-500 text-sm mb-1"><i className="pi pi-user mr-2"></i>{trip.nombre_piloto}</p>
                <p className="m-0 text-500 text-sm mb-1"><i className="pi pi-map-marker mr-2"></i>Hacia: {trip.nombre_tienda} ({trip.pais_destino})</p>
                <p className="m-0 text-400 text-xs mt-2 text-right">Vel: {trip.velocidad || 0} km/h</p>
              </Card>
            ))
          )}
        </div>

        {/* Mapa Global */}
        <div className="col-12 md:col-9 h-full relative border-round-xl overflow-hidden shadow-3">
          <MapContainer
            center={[14.6349, -90.5069]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {activeTrips.map(trip => {
              if (!trip.latitud || !trip.longitud) return null;
              return (
                <Marker
                  key={trip.id}
                  position={[trip.latitud, trip.longitud]}
                  icon={trip.isDelayed ? alertIcon : defaultIcon}
                >
                  <Popup>
                    <div>
                      <h4 className="m-0">{trip.placa_vehiculo}</h4>
                      <p className="m-0 text-sm">{trip.nombre_piloto}</p>
                      <p className="m-0 text-sm text-500">Destino: {trip.nombre_tienda}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
