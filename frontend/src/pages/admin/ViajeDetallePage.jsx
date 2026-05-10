import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { obtenerViajeDetalle, obtenerHistorial, registrarCheckpoint, actualizarPosicion } from '../../api/trackingApi';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Mapeo de estados
const estadoOptions = [
  { label: 'Planificado', value: 'planificado' },
  { label: 'En Ruta', value: 'en_ruta' },
  { label: 'En Aduana', value: 'en_aduana' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Retrasado', value: 'retrasado' },
  { label: 'Cancelado', value: 'cancelado' },
];

const estadoSeverity = {
  planificado: 'info',
  en_ruta: 'success',
  en_aduana: 'warning',
  entregado: 'success',
  retrasado: 'danger',
  cancelado: 'danger',
};

const estadoIcons = {
  planificado: 'pi pi-calendar',
  en_ruta: 'pi pi-truck',
  en_aduana: 'pi pi-shield',
  entregado: 'pi pi-check-circle',
  retrasado: 'pi pi-exclamation-triangle',
  cancelado: 'pi pi-times-circle',
};

const estadoLabels = {
  planificado: 'Planificado',
  en_ruta: 'En Ruta',
  en_aduana: 'En Aduana',
  entregado: 'Entregado',
  retrasado: 'Retrasado',
  cancelado: 'Cancelado',
};

export default function ViajeDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [viaje, setViaje] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const gpsIntervalRef = useRef(null);

  const [checkpointForm, setCheckpointForm] = useState({
    estado: '',
    ubicacion_nombre: '',
    pais: '',
    notas: '',
    latitud: null,
    longitud: null,
  });

  useEffect(() => {
    loadData();
    return () => {
      // Limpiar GPS al salir
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
      }
    };
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [viajeData, historialData] = await Promise.all([
        obtenerViajeDetalle(id),
        obtenerHistorial(id),
      ]);
      setViaje(viajeData);
      setCheckpoints(historialData);
    } catch (error) {
      showError('Error al cargar datos del viaje');
    } finally {
      setLoading(false);
    }
  };

  // --- GPS automático desde el navegador ---
  const iniciarGPS = () => {
    if (!navigator.geolocation) {
      showError('Tu navegador no soporta geolocalización');
      return;
    }

    setGpsActive(true);
    // Enviar posición cada 15 segundos
    const enviarPosicion = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await actualizarPosicion(id, {
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
              velocidad: position.coords.speed ? (position.coords.speed * 3.6) : null, // m/s a km/h
              rumbo: position.coords.heading,
              precision_gps: position.coords.accuracy,
            });
          } catch (err) {
            console.error('Error enviando posición GPS:', err);
          }
        },
        (err) => {
          console.error('Error de geolocalización:', err);
          showError('No se pudo obtener la ubicación GPS');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    enviarPosicion(); // Enviar inmediatamente
    gpsIntervalRef.current = setInterval(enviarPosicion, 15000);
  };

  const detenerGPS = () => {
    setGpsActive(false);
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
  };

  // --- Registrar Checkpoint ---
  const openCheckpointDialog = () => {
    // Obtener ubicación actual del navegador para pre-llenar
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCheckpointForm(prev => ({
            ...prev,
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude,
          }));
        },
        () => { /* Si falla, se deja sin coordenadas */ }
      );
    }
    setCheckpointForm({
      estado: '',
      ubicacion_nombre: '',
      pais: '',
      notas: '',
      latitud: null,
      longitud: null,
    });
    setDialogVisible(true);
  };

  const saveCheckpoint = async () => {
    if (!checkpointForm.estado) {
      showError('Seleccione un estado');
      return;
    }
    try {
      await registrarCheckpoint(id, checkpointForm);
      showSuccess('Checkpoint registrado exitosamente');
      setDialogVisible(false);
      loadData();
    } catch (error) {
      showError(error.response?.data?.detail || 'Error al registrar checkpoint');
    }
  };

  // --- Timeline marker template ---
  const timelineMarker = (item) => (
    <span
      className="flex align-items-center justify-content-center border-circle"
      style={{
        width: '2rem',
        height: '2rem',
        backgroundColor: `var(--${estadoSeverity[item.estado] || 'primary'}-color, var(--primary-color))`,
        color: '#fff',
      }}
    >
      <i className={`${estadoIcons[item.estado] || 'pi pi-circle'} text-sm`} />
    </span>
  );

  const timelineContent = (item) => {
    const fecha = new Date(item.fecha_evento);
    return (
      <Card className="mb-2">
        <div className="flex flex-column gap-1">
          <div className="flex justify-content-between align-items-center">
            <Tag severity={estadoSeverity[item.estado]} value={estadoLabels[item.estado] || item.estado} />
            <span className="text-500 text-xs">
              {fecha.toLocaleDateString('es-GT')} {fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {item.ubicacion_nombre && (
            <div className="text-sm flex align-items-center gap-1">
              <i className="pi pi-map-marker text-xs" />
              <span>{item.ubicacion_nombre}{item.pais ? ` — ${item.pais}` : ''}</span>
            </div>
          )}
          {item.notas && <p className="text-sm text-600 m-0 mt-1">{item.notas}</p>}
          {item.nombre_registrador && (
            <span className="text-xs text-400">Registrado por: {item.nombre_registrador}</span>
          )}
        </div>
      </Card>
    );
  };

  // --- Puntos del mapa ---
  const checkpointsConCoords = checkpoints.filter(cp => cp.latitud && cp.longitud);
  const routePositions = checkpointsConCoords.map(cp => [parseFloat(cp.latitud), parseFloat(cp.longitud)]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="page-container text-center">
        <h2>Viaje no encontrado</h2>
        <Button label="Volver" icon="pi pi-arrow-left" onClick={() => navigate('/viajes')} />
      </div>
    );
  }

  const isPiloto = user?.role === 'LEVEL_3';
  const isViajeActivo = viaje.estado === 'en_ruta' || viaje.estado === 'en_aduana';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex justify-content-between align-items-center mb-4">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => navigate('/viajes')} />
          <div>
            <h1 className="text-2xl font-bold m-0">
              Viaje — {viaje.placa_vehiculo}
            </h1>
            <p className="text-500 mt-1 mb-0">
              ID: {viaje.id?.slice(0, 8)}... · Destino: {viaje.nombre_tienda} ({viaje.pais_destino})
            </p>
          </div>
        </div>
        <div className="flex gap-2 align-items-center">
          <Tag severity={estadoSeverity[viaje.estado]} value={estadoLabels[viaje.estado] || viaje.estado} className="text-base px-3 py-2" />
          {!isPiloto && (
            <Button label="Registrar Checkpoint" icon="pi pi-plus" onClick={openCheckpointDialog} />
          )}
          {isPiloto && isViajeActivo && (
            <Button
              label={gpsActive ? 'Detener GPS' : 'Iniciar GPS'}
              icon={gpsActive ? 'pi pi-stop-circle' : 'pi pi-map-marker'}
              severity={gpsActive ? 'danger' : 'success'}
              onClick={gpsActive ? detenerGPS : iniciarGPS}
            />
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid mb-4">
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Piloto</div>
            <div className="font-semibold">{viaje.nombre_piloto}</div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Vehículo</div>
            <div className="font-semibold">{viaje.placa_vehiculo}</div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Contenedor</div>
            <div className="font-semibold">{viaje.numero_contenedor || 'N/A'}</div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Fecha Planificada</div>
            <div className="font-semibold">
              {viaje.fecha_plan_salida ? new Date(viaje.fecha_plan_salida).toLocaleDateString('es-GT') : 'N/A'}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid">
        {/* Mapa con ruta */}
        <div className="col-12 lg:col-7">
          <Card title="Mapa de Recorrido">
            <MapContainer
              center={routePositions.length > 0 ? routePositions[routePositions.length - 1] : [14.6349, -90.5069]}
              zoom={7}
              style={{ height: '50vh', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Línea de ruta */}
              {routePositions.length > 1 && (
                <Polyline positions={routePositions} color="#6366f1" weight={3} opacity={0.8} />
              )}
              {/* Marcadores de checkpoints */}
              {checkpointsConCoords.map((cp, idx) => (
                <Marker key={cp.id} position={[parseFloat(cp.latitud), parseFloat(cp.longitud)]}>
                  <Popup>
                    <strong>{estadoLabels[cp.estado] || cp.estado}</strong>
                    {cp.ubicacion_nombre && <><br />{cp.ubicacion_nombre}</>}
                    {cp.pais && <><br />{cp.pais}</>}
                    <br />
                    <small>{new Date(cp.fecha_evento).toLocaleString('es-GT')}</small>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* Timeline de checkpoints */}
        <div className="col-12 lg:col-5">
          <Card title="Historial de Eventos">
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {checkpoints.length === 0 ? (
                <div className="text-center text-500 p-4">
                  <i className="pi pi-clock text-4xl mb-2" style={{ display: 'block' }} />
                  <p>No hay checkpoints registrados</p>
                </div>
              ) : (
                <Timeline
                  value={checkpoints}
                  marker={timelineMarker}
                  content={timelineContent}
                  className="customized-timeline"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dialog para nuevo checkpoint */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '450px' }}
        header="Registrar Checkpoint"
        modal
        className="p-fluid"
        onHide={() => setDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="cp_estado">Nuevo Estado *</label>
          <Dropdown
            id="cp_estado"
            value={checkpointForm.estado}
            onChange={(e) => setCheckpointForm({ ...checkpointForm, estado: e.value })}
            options={estadoOptions}
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione estado"
          />
        </div>
        <div className="field">
          <label htmlFor="cp_ubicacion">Ubicación</label>
          <InputText
            id="cp_ubicacion"
            value={checkpointForm.ubicacion_nombre}
            onChange={(e) => setCheckpointForm({ ...checkpointForm, ubicacion_nombre: e.target.value })}
            placeholder="Ej: Aduana El Amatillo"
          />
        </div>
        <div className="field">
          <label htmlFor="cp_pais">País</label>
          <Dropdown
            id="cp_pais"
            value={checkpointForm.pais}
            onChange={(e) => setCheckpointForm({ ...checkpointForm, pais: e.value })}
            options={[
              { label: 'Guatemala', value: 'Guatemala' },
              { label: 'El Salvador', value: 'El Salvador' },
              { label: 'Honduras', value: 'Honduras' },
              { label: 'Nicaragua', value: 'Nicaragua' },
              { label: 'Costa Rica', value: 'Costa Rica' },
              { label: 'Panamá', value: 'Panamá' },
            ]}
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione país"
          />
        </div>
        <div className="field">
          <label htmlFor="cp_notas">Notas</label>
          <InputTextarea
            id="cp_notas"
            value={checkpointForm.notas}
            onChange={(e) => setCheckpointForm({ ...checkpointForm, notas: e.target.value })}
            rows={3}
          />
        </div>
        {checkpointForm.latitud && (
          <div className="text-sm text-500 mb-3">
            <i className="pi pi-map-marker mr-1" />
            Coordenadas capturadas: {checkpointForm.latitud?.toFixed(4)}, {checkpointForm.longitud?.toFixed(4)}
          </div>
        )}
        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDialogVisible(false)} />
          <Button label="Registrar" icon="pi pi-check" onClick={saveCheckpoint} />
        </div>
      </Dialog>
    </div>
  );
}
