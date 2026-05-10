import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNavigate } from 'react-router-dom';
import { obtenerViajesActivos } from '../../api/trackingApi';
import { useToast } from '../../hooks/useToast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos por defecto de Leaflet en bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ícono personalizado para furgones en ruta
const truckIcon = new L.DivIcon({
  className: 'truck-marker',
  html: '<div style="background:#22c55e;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="pi pi-truck"></i></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const truckIconAduana = new L.DivIcon({
  className: 'truck-marker-aduana',
  html: '<div style="background:#f59e0b;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="pi pi-shield"></i></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Componente para centrar el mapa cuando se selecciona un viaje
function FlyToViaje({ viaje }) {
  const map = useMap();
  useEffect(() => {
    if (viaje && viaje.latitud && viaje.longitud) {
      map.flyTo([viaje.latitud, viaje.longitud], 10, { duration: 1.5 });
    }
  }, [viaje, map]);
  return null;
}

// Mapeo de estado a severidad visual
const estadoSeverity = {
  en_ruta: 'success',
  en_aduana: 'warning',
};

const estadoLabels = {
  en_ruta: 'En Ruta',
  en_aduana: 'En Aduana',
};

export default function MonitoreoPage() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const { showError } = useToast();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Centro por defecto: Guatemala
  const defaultCenter = [14.6349, -90.5069];

  useEffect(() => {
    loadViajes();
    // Auto-refrescar cada 30 segundos
    intervalRef.current = setInterval(loadViajes, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const loadViajes = async () => {
    try {
      const data = await obtenerViajesActivos();
      setViajes(data);
    } catch (error) {
      showError('Error al cargar viajes activos');
    } finally {
      setLoading(false);
    }
  };

  const viajesConPosicion = viajes.filter(v => v.latitud && v.longitud);

  return (
    <div className="page-container">
      <div className="page-header flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold m-0">Monitoreo en Tiempo Real</h1>
          <p className="text-500 mt-1 mb-0">
            {viajes.length} viaje(s) activo(s) — Actualización automática cada 30s
          </p>
        </div>
        <Button label="Refrescar" icon="pi pi-refresh" className="p-button-outlined" onClick={loadViajes} loading={loading} />
      </div>

      <div className="grid">
        {/* Panel lateral de viajes */}
        <div className="col-12 md:col-4 lg:col-3">
          <div className="flex flex-column gap-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading && (
              <div className="flex justify-content-center p-4">
                <ProgressSpinner style={{ width: '40px', height: '40px' }} />
              </div>
            )}

            {!loading && viajes.length === 0 && (
              <Card>
                <div className="text-center text-500 p-3">
                  <i className="pi pi-map-marker text-4xl mb-2" style={{ display: 'block' }} />
                  <p>No hay viajes activos en este momento</p>
                </div>
              </Card>
            )}

            {viajes.map(viaje => (
              <Card
                key={viaje.id}
                className={`cursor-pointer transition-all transition-duration-200 ${selectedViaje?.id === viaje.id ? 'border-primary' : ''}`}
                style={{
                  borderLeft: selectedViaje?.id === viaje.id ? '4px solid var(--primary-color)' : '4px solid transparent',
                }}
                onClick={() => setSelectedViaje(viaje)}
              >
                <div className="flex flex-column gap-2">
                  <div className="flex justify-content-between align-items-center">
                    <span className="font-semibold text-sm">{viaje.placa_vehiculo || 'Sin placa'}</span>
                    <Tag
                      severity={estadoSeverity[viaje.estado] || 'info'}
                      value={estadoLabels[viaje.estado] || viaje.estado}
                    />
                  </div>
                  <div className="text-sm">
                    <div className="flex align-items-center gap-1 text-600">
                      <i className="pi pi-user text-xs" />
                      <span>{viaje.nombre_piloto || 'Sin piloto'}</span>
                    </div>
                    <div className="flex align-items-center gap-1 text-600 mt-1">
                      <i className="pi pi-map-marker text-xs" />
                      <span>{viaje.nombre_tienda} ({viaje.pais_destino})</span>
                    </div>
                    {viaje.velocidad != null && (
                      <div className="flex align-items-center gap-1 text-600 mt-1">
                        <i className="pi pi-gauge text-xs" />
                        <span>{viaje.velocidad} km/h</span>
                      </div>
                    )}
                  </div>
                  <Button
                    label="Ver Detalle"
                    icon="pi pi-eye"
                    className="p-button-sm p-button-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/viajes/${viaje.id}`);
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="col-12 md:col-8 lg:col-9">
          <Card className="p-0" style={{ overflow: 'hidden' }}>
            <MapContainer
              center={defaultCenter}
              zoom={6}
              style={{ height: '70vh', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyToViaje viaje={selectedViaje} />

              {viajesConPosicion.map(viaje => (
                <Marker
                  key={viaje.id}
                  position={[viaje.latitud, viaje.longitud]}
                  icon={viaje.estado === 'en_aduana' ? truckIconAduana : truckIcon}
                  eventHandlers={{
                    click: () => setSelectedViaje(viaje),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <strong>{viaje.placa_vehiculo}</strong>
                      <br />
                      <span>Piloto: {viaje.nombre_piloto}</span>
                      <br />
                      <span>Destino: {viaje.nombre_tienda}</span>
                      <br />
                      <span>Estado: {estadoLabels[viaje.estado] || viaje.estado}</span>
                      {viaje.velocidad != null && (
                        <>
                          <br />
                          <span>Velocidad: {viaje.velocidad} km/h</span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
