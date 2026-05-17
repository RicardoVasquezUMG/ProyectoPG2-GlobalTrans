import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { getAduanas } from '../../api/aduanasApi';
import { registrarCheckpoint, actualizarPosicion, obtenerViajeDetalle } from '../../api/trackingApi';
import { ESTADOS_VIAJE, EVENT_TYPES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RoutingControl from '../../components/operator/RoutingControl';

import 'leaflet/dist/leaflet.css';
import './NavegacionViajePage.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/12781/12781217.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

export default function NavegacionViajePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();

  const [viaje, setViaje] = useState(null);
  const [aduanas, setAduanas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Posición en tiempo real
  const [currentPosition, setCurrentPosition] = useState(null);
  const watchIdRef = useRef(null);
  const lastSyncRef = useRef(0);
  const mapRef = useRef(null);

  // Modales
  const [showAduanaModal, setShowAduanaModal] = useState(false);
  const [showIncidenteModal, setShowIncidenteModal] = useState(false);
  const [showPausaModal, setShowPausaModal] = useState(false);

  // UI Toggles
  const [showActions, setShowActions] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  // Formularios
  const [aduanaData, setAduanaData] = useState({ tipo: '', aduana_id: '', notas: '' });
  const [incidenteData, setIncidenteData] = useState({ tipo: '', notas: '' });
  const [pausaData, setPausaData] = useState({ tipo: '', notas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vData, aData] = await Promise.all([
        obtenerViajeDetalle(id),
        getAduanas()
      ]);
      setViaje(vData);
      setAduanas(aData.map(a => ({ label: a.nombre, value: a.id, data: a })));

      // Si el viaje estaba planificado, al abrir esta vista lo marcamos como en ruta
      if (vData.estado === ESTADOS_VIAJE.PLANIFICADO) {
        await handleRegisterEvent(ESTADOS_VIAJE.EN_RUTA, 'Inicio Viaje', 'El viaje ha comenzado');
      }

    } catch (error) {
      showError('Error al cargar datos del viaje');
      navigate('/mis-viajes');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      showError('Geolocalización no soportada por el navegador');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading, accuracy } = position.coords;
        setCurrentPosition([latitude, longitude]);

        // Sync with backend max every 15 seconds to avoid spamming
        const now = Date.now();
        if (now - lastSyncRef.current > 15000) {
          syncPosition(latitude, longitude, speed, heading, accuracy);
          lastSyncRef.current = now;
        }
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };

  const syncPosition = async (lat, lng, speed, heading, accuracy) => {
    try {
      await actualizarPosicion(id, {
        latitud: lat,
        longitud: lng,
        velocidad: speed,
        rumbo: heading,
        precision_gps: accuracy
      });
    } catch (e) {
      // Silently fail sync, will try again later
    }
  };

  const handleRegisterEvent = async (estado, ubicacion, notas, showAlert = true) => {
    try {
      setIsSubmitting(true);

      // Intentar obtener última posición para el checkpoint
      let lat = currentPosition ? currentPosition[0] : null;
      let lng = currentPosition ? currentPosition[1] : null;

      await registrarCheckpoint(id, {
        estado: estado,
        ubicacion_nombre: ubicacion,
        latitud: lat,
        longitud: lng,
        notas: notas
      });

      if (showAlert) showSuccess('Evento registrado correctamente');

      // Refrescar viaje para ver nuevo estado
      const vData = await obtenerViajeDetalle(id);
      setViaje(vData);

      return true;
    } catch (error) {
      showError('Error al registrar el evento');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAduana = async () => {
    if (!aduanaData.tipo || !aduanaData.aduana_id) return showError('Selecciona tipo y aduana');

    const aduanaObj = aduanas.find(a => a.value === aduanaData.aduana_id);
    const nombreAduana = aduanaObj ? aduanaObj.label : 'Aduana';

    // Si llega a aduana, el estado es EN_ADUANA. Si sale, es EN_RUTA
    const estadoViaje = aduanaData.tipo === EVENT_TYPES.ADUANA_LLEGADA ? ESTADOS_VIAJE.EN_ADUANA : ESTADOS_VIAJE.EN_RUTA;

    const success = await handleRegisterEvent(estadoViaje, nombreAduana, `EVENTO: ${aduanaData.tipo} | ${aduanaData.notas}`);
    if (success) setShowAduanaModal(false);
  };

  const submitIncidente = async () => {
    if (!incidenteData.tipo) return showError('Selecciona el tipo de incidente');

    // Incidentes ponen el estado en RETRASADO
    const success = await handleRegisterEvent(ESTADOS_VIAJE.RETRASADO, 'En Ruta (Incidente)', `EVENTO: ${incidenteData.tipo} | ${incidenteData.notas}`);
    if (success) setShowIncidenteModal(false);
  };

  const submitPausa = async () => {
    if (!pausaData.tipo) return showError('Selecciona el motivo de la pausa');

    // Pausas mantienen el estado EN_RUTA
    const success = await handleRegisterEvent(ESTADOS_VIAJE.EN_RUTA, 'En Ruta (Pausa)', `EVENTO: ${pausaData.tipo} | ${pausaData.notas}`);
    if (success) setShowPausaModal(false);
  };

  const handleEndTrip = async () => {
    if (window.confirm("¿Estás seguro de finalizar el viaje e indicar que la carga fue entregada?")) {
      const success = await handleRegisterEvent(ESTADOS_VIAJE.ENTREGADO, 'Destino', 'Viaje Finalizado');
      if (success) navigate('/mis-viajes');
    }
  };



  const handleRecenter = () => {
    if (mapRef.current && currentPosition) {
      mapRef.current.setView(currentPosition, 18, { animate: true });
    }
  };

  if (loading || !viaje) return <LoadingSpinner />;

  return (
    <div className="navegacion-page">
      <div className="map-container">
        <MapContainer
          center={currentPosition || [14.6349, -90.5069]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {currentPosition && (
            <Marker position={currentPosition} icon={truckIcon}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
          )}
          {currentPosition && viaje?.tienda_latitud && viaje?.tienda_longitud && (
            <RoutingControl
              start={currentPosition}
              end={[parseFloat(viaje.tienda_latitud), parseFloat(viaje.tienda_longitud)]}
              showItinerary={showItinerary}
            />
          )}
        </MapContainer>

        {/* Botón Flotante para Re-centrar el Mapa */}
        {currentPosition && (
          <div className="absolute z-5" style={{ bottom: showActions ? '220px' : '90px', right: '20px', zIndex: 1000, transition: 'bottom 0.3s' }}>
            <Button
              icon="pi pi-compass"
              className="p-button-rounded p-button-secondary p-button-lg shadow-4"
              onClick={handleRecenter}
              aria-label="Centrar Mapa"
            />
          </div>
        )}

        {/* Panel Superior: Status e Info */}
        <div className="status-panel p-2">
          <div className="flex justify-content-between align-items-center">
            <div>
              <h3 className="m-0 text-white">Destino: {viaje.nombre_tienda}</h3>
              <p className="m-0 text-white text-sm">Estado actual: {viaje.estado.replace('_', ' ').toUpperCase()}</p>
            </div>

          </div>
        </div>

        {/* Botón flotante para mostrar acciones */}
        {!showActions && (
          <div className="flex justify-content-center w-full absolute bottom-0 mb-4 z-5" style={{ zIndex: 1000 }}>
            <Button
              label="Opciones del Viaje"
              icon="pi pi-chevron-up"
              className="p-button-rounded p-button-lg shadow-6"
              onClick={() => setShowActions(true)}
            />
          </div>
        )}

        {/* Action Bottom Sheet */}
        {showActions && (
          <div className="action-sheet p-3 shadow-4 border-round-top-xl transition-all duration-300" style={{ backgroundColor: 'var(--surface-card)', opacity: 1 }}>
            <div className="flex flex-column align-items-center mb-3 w-full">
              <Button
                icon="pi pi-chevron-down"
                rounded
                text
                className="p-button-lg mb-2"
                onClick={() => setShowActions(false)}
                aria-label="Ocultar"
                style={{ width: '3rem', height: '3rem' }}
              />
              <h4 className="m-0 w-full text-center">Opciones de Viaje</h4>
            </div>
            <div className="grid grid-nogutter gap-2">
              <div className="col-12 flex gap-2">
                <Button label="Aduana" icon="pi pi-building" className="flex-1 p-button-warning" onClick={() => setShowAduanaModal(true)} />
                <Button label="Pausa" icon="pi pi-coffee" className="flex-1 p-button-secondary" onClick={() => setShowPausaModal(true)} />
              </div>
              <div className="col-12 flex gap-2 mt-2">
                <Button label="Incidente" icon="pi pi-exclamation-triangle" className="flex-1 p-button-danger" onClick={() => setShowIncidenteModal(true)} />
                <Button label="Finalizar" icon="pi pi-check" className="flex-1 p-button-success" onClick={handleEndTrip} disabled={viaje.estado === ESTADOS_VIAJE.ENTREGADO} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Aduana */}
      <Dialog header="Registro en Aduana" visible={showAduanaModal} style={{ width: '90vw', maxWidth: '400px' }} onHide={() => setShowAduanaModal(false)}>
        <div className="flex flex-column gap-3 mt-2">
          <Dropdown
            options={[
              { label: 'Llegada a Aduana', value: EVENT_TYPES.ADUANA_LLEGADA },
              { label: 'Salida de Aduana', value: EVENT_TYPES.ADUANA_SALIDA }
            ]}
            value={aduanaData.tipo}
            onChange={(e) => setAduanaData({ ...aduanaData, tipo: e.value })}
            placeholder="Seleccione el evento"
          />
          <Dropdown
            options={aduanas}
            value={aduanaData.aduana_id}
            onChange={(e) => setAduanaData({ ...aduanaData, aduana_id: e.value })}
            placeholder="Seleccione la Aduana"
            filter
          />
          <InputTextarea
            placeholder="Notas (opcional)..."
            value={aduanaData.notas}
            onChange={(e) => setAduanaData({ ...aduanaData, notas: e.target.value })}
            rows={3}
          />
          <Button label="Registrar" loading={isSubmitting} onClick={submitAduana} />
        </div>
      </Dialog>

      {/* Modal Incidente */}
      <Dialog header="Reportar Incidente" visible={showIncidenteModal} style={{ width: '90vw', maxWidth: '400px' }} onHide={() => setShowIncidenteModal(false)}>
        <div className="flex flex-column gap-3 mt-2">
          <Dropdown
            options={[
              { label: EVENT_TYPES.INCIDENTE_MECANICO, value: EVENT_TYPES.INCIDENTE_MECANICO },
              { label: EVENT_TYPES.INCIDENTE_ACCIDENTE, value: EVENT_TYPES.INCIDENTE_ACCIDENTE },
              { label: EVENT_TYPES.INCIDENTE_TRAFICO, value: EVENT_TYPES.INCIDENTE_TRAFICO }
            ]}
            value={incidenteData.tipo}
            onChange={(e) => setIncidenteData({ ...incidenteData, tipo: e.value })}
            placeholder="Tipo de Incidente"
          />
          <InputTextarea
            placeholder="Describa la situación..."
            value={incidenteData.notas}
            onChange={(e) => setIncidenteData({ ...incidenteData, notas: e.target.value })}
            rows={4}
          />
          <Button label="Reportar" severity="danger" loading={isSubmitting} onClick={submitIncidente} />
        </div>
      </Dialog>

      {/* Modal Pausa */}
      <Dialog header="Registrar Pausa" visible={showPausaModal} style={{ width: '90vw', maxWidth: '400px' }} onHide={() => setShowPausaModal(false)}>
        <div className="flex flex-column gap-3 mt-2">
          <Dropdown
            options={[
              { label: EVENT_TYPES.PAUSA_ALIMENTACION, value: EVENT_TYPES.PAUSA_ALIMENTACION },
              { label: EVENT_TYPES.PAUSA_DESCANSO, value: EVENT_TYPES.PAUSA_DESCANSO },
              { label: EVENT_TYPES.PAUSA_COMBUSTIBLE, value: EVENT_TYPES.PAUSA_COMBUSTIBLE }
            ]}
            value={pausaData.tipo}
            onChange={(e) => setPausaData({ ...pausaData, tipo: e.value })}
            placeholder="Motivo de la pausa"
          />
          <InputTextarea
            placeholder="Notas adicionales..."
            value={pausaData.notas}
            onChange={(e) => setPausaData({ ...pausaData, notas: e.target.value })}
            rows={2}
          />
          <Button label="Registrar Pausa" severity="secondary" loading={isSubmitting} onClick={submitPausa} />
        </div>
      </Dialog>
    </div>
  );
}
