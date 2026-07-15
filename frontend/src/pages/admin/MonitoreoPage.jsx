import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { obtenerViajesActivos, obtenerRutaPlanificada } from '../../api/trackingApi';
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

// Ícono del tráiler original (Flaticon)
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/12781/12781217.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

// Ícono en caso de alerta o detención en aduana
const truckIconAduana = new L.DivIcon({
  className: 'breakdown-marker',
  html: '<div style="background:#dc2626;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid #fff;"><i class="pi pi-exclamation-triangle"></i></div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
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
  const [rutaData, setRutaData] = useState(null);
  const [loadingRuta, setLoadingRuta] = useState(false);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Centro por defecto: Guatemala / Centroamérica
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

  const handleSelectViaje = async (viaje) => {
    setSelectedViaje(viaje);
    if (!viaje) {
      setRutaData(null);
      return;
    }
    try {
      setLoadingRuta(true);
      const data = await obtenerRutaPlanificada(viaje.id);
      setRutaData(data);
    } catch (e) {
      setRutaData(null);
    } finally {
      setLoadingRuta(false);
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
                className={`cursor-pointer transition-all transition-duration-200 ${selectedViaje?.id === viaje.id ? 'border-primary shadow-4' : ''}`}
                style={{
                  borderLeft: selectedViaje?.id === viaje.id ? '4px solid var(--primary-color)' : '4px solid transparent',
                }}
                onClick={() => handleSelectViaje(viaje)}
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
                  <div className="flex gap-2 mt-2">
                    <Button
                      label={selectedViaje?.id === viaje.id ? "Ocultar Ruta" : "Ver Ruta Planificada"}
                      icon="pi pi-directions"
                      severity={selectedViaje?.id === viaje.id ? "secondary" : "primary"}
                      className="p-button-sm flex-1 font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedViaje?.id === viaje.id) {
                          setSelectedViaje(null);
                          setRutaData(null);
                        } else {
                          handleSelectViaje(viaje);
                        }
                      }}
                    />
                    <Button
                      label="Detalle"
                      icon="pi pi-eye"
                      className="p-button-sm p-button-outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/viajes/${viaje.id}`);
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mapa y Alertas */}
        <div className="col-12 md:col-8 lg:col-9">
          {rutaData && rutaData.alerta_desvio && (
            <div className="mb-3">
              <Message
                severity="error"
                text={`¡ALERTA CRÍTICA DE DESVÍO!: El vehículo se encuentra desviado ${rutaData.desvio_km} km de la ruta planificada. Se ha notificado al administrador.`}
                className="w-full"
              />
            </div>
          )}

          {rutaData && !rutaData.alerta_desvio && (
            <div className="mb-3">
              <Message
                severity="info"
                text={`Ruta trazada hacia ${rutaData.tienda} (${rutaData.pais_destino}). Desvío actual: ${rutaData.desvio_km} km (Dentro de margen autorizado de 5 km).`}
                className="w-full"
              />
            </div>
          )}

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

              {/* Trazado de la ruta planificada si hay viaje seleccionado */}
              {rutaData && rutaData.waypoints && (
                <Polyline
                  positions={rutaData.waypoints}
                  pathOptions={{
                    color: rutaData.alerta_desvio ? '#ef4444' : '#3b82f6',
                    weight: 5,
                    dashArray: rutaData.alerta_desvio ? '10, 10' : undefined,
                    opacity: 0.85
                  }}
                />
              )}

              {/* Marcadores de paradas planificadas (aduanas/hubs) */}
              {rutaData && rutaData.paradas_principales && rutaData.paradas_principales.map((parada, idx) => (
                <Marker
                  key={`parada-${idx}`}
                  position={[parada.lat, parada.lng]}
                >
                  <Popup>
                    <div>
                      <strong>Punto de Control / Parada</strong>
                      <br />
                      <span>{parada.nombre}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {viajesConPosicion.map(viaje => (
                <Marker
                  key={viaje.id}
                  position={[viaje.latitud, viaje.longitud]}
                  icon={viaje.estado === 'en_aduana' ? truckIconAduana : truckIcon}
                  eventHandlers={{
                    click: () => handleSelectViaje(viaje),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }} className="p-1">
                      <strong className="text-base block mb-1">{viaje.placa_vehiculo}</strong>
                      <span className="block text-sm"><strong>Piloto:</strong> {viaje.nombre_piloto || 'Sin piloto'}</span>
                      <span className="block text-sm"><strong>Destino:</strong> {viaje.nombre_tienda}</span>
                      <span className="block text-sm"><strong>Estado:</strong> {estadoLabels[viaje.estado] || viaje.estado}</span>
                      {viaje.velocidad != null && (
                        <span className="block text-sm text-500"><strong>Velocidad:</strong> {viaje.velocidad} km/h</span>
                      )}
                      <div className="mt-2 pt-2 border-top-1 border-300">
                        <Button
                          label="Ver Ruta Planificada"
                          icon="pi pi-directions"
                          className="p-button-sm p-button-primary w-full font-bold"
                          onClick={() => handleSelectViaje(viaje)}
                        />
                      </div>
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
