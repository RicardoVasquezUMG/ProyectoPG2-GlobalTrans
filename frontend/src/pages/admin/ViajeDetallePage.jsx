import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { obtenerViajeDetalle, obtenerHistorial, registrarCheckpoint, actualizarPosicion } from '../../api/trackingApi';
import { getGastosViaje, saveGastosViaje } from '../../api/viajesApi';
import { getFichaAuditoriaViaje } from '../../api/reportsApi';
import { exportFichaViajePDF } from '../../utils/pdfGenerator';
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

// Componente para animar y centrar el mapa suavemente
function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target[0] && target[1]) {
      map.flyTo(target, 10, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

// Ícono de destino (Tienda)
const storeIcon = new L.DivIcon({
  className: 'store-destination-marker',
  html: `
    <div style="background:#059669;color:#ffffff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #ffffff;">
      <i class="pi pi-shop" style="font-size:16px;"></i>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// Ícono del camión en posición actual
const createTruckMarker = (estado) => {
  const bg = estado === 'en_aduana' ? '#d97706' : estado === 'retrasado' ? '#dc2626' : '#2563eb';
  return new L.DivIcon({
    className: 'truck-current-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="truck-pulse-marker" style="background:${bg};color:#ffffff;border-radius:50%;width:46px;height:46px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.45);border:3px solid #ffffff;cursor:pointer;">
          <i class="pi pi-truck" style="font-size:22px;color:#ffffff;"></i>
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23],
  });
};

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
  const [gastosDialogVisible, setGastosDialogVisible] = useState(false);
  const [gastos, setGastos] = useState({
    flete_base: 0,
    multas_aduana: 0,
    viaticos_extra: 0,
    parqueo_almacenaje: 0,
    otros_imprevistos: 0,
    notas: '',
    total_sobrecostos: 0,
    total_gasto: 0
  });
  const [savingGastos, setSavingGastos] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const gpsIntervalRef = useRef(null);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      const ficha = await getFichaAuditoriaViaje(id);
      await exportFichaViajePDF(ficha);
      showSuccess('Guía de auditoría descargada correctamente en PDF');
    } catch (e) {
      showError('Error al generar el PDF de auditoría del viaje');
    } finally {
      setDownloadingPdf(false);
    }
  };

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
    loadGastos();
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

  const loadGastos = async () => {
    try {
      const data = await getGastosViaje(id);
      if (data) {
        setGastos({
          flete_base: data.flete_base || 0,
          multas_aduana: data.multas_aduana || 0,
          viaticos_extra: data.viaticos_extra || 0,
          parqueo_almacenaje: data.parqueo_almacenaje || 0,
          otros_imprevistos: data.otros_imprevistos || 0,
          notas: data.notas || '',
          total_sobrecostos: data.total_sobrecostos || 0,
          total_gasto: data.total_gasto || 0
        });
      }
    } catch (e) {
      // Sin gastos registrados aún
    }
  };

  const handleSaveGastos = async () => {
    try {
      setSavingGastos(true);
      const saved = await saveGastosViaje(id, {
        viaje_id: id,
        ...gastos
      });
      setGastos(saved);
      showSuccess('Costos y sobrecostos del viaje guardados exitosamente');
      setGastosDialogVisible(false);
    } catch (error) {
      showError('Error al guardar costos del viaje');
    } finally {
      setSavingGastos(false);
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
      <Card
        className="mb-3 shadow-1 border-round-lg w-full"
        style={{
          borderLeft: `4px solid var(--${estadoSeverity[item.estado] || 'primary'}-color, #3b82f6)`
        }}
      >
        <div className="flex flex-column gap-1">
          <div className="flex justify-content-between align-items-center flex-wrap gap-2">
            <Tag severity={estadoSeverity[item.estado]} value={estadoLabels[item.estado] || item.estado} className="text-xs font-bold" />
            <span className="text-500 text-xs font-semibold">
              <i className="pi pi-calendar mr-1"></i>
              {fecha.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })} {fecha.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {item.ubicacion_nombre && (
            <div className="text-sm font-semibold text-800 flex align-items-center gap-2 mt-1">
              <i className="pi pi-map-marker text-primary text-sm" />
              <span>{item.ubicacion_nombre}{item.pais ? ` — ${item.pais}` : ''}</span>
            </div>
          )}
          {item.notas && (
            <p className="text-sm text-600 m-0 mt-1 bg-surface-50 p-2 border-round">
              {item.notas}
            </p>
          )}
          {item.latitud && item.longitud && (
            <span className="text-xs text-400 mt-1">
              GPS: {parseFloat(item.latitud).toFixed(4)}, {parseFloat(item.longitud).toFixed(4)}
            </span>
          )}
          {item.nombre_registrador && (
            <span className="text-xs text-400">
              Registrado por: <strong>{item.nombre_registrador}</strong>
            </span>
          )}
        </div>
      </Card>
    );
  };

  // --- Puntos del mapa y Posición del Camión ---
  const [flyTarget, setFlyTarget] = useState(null);
  const checkpointsConCoords = checkpoints.filter(cp => cp.latitud && cp.longitud);
  const routePositions = checkpointsConCoords.map(cp => [parseFloat(cp.latitud), parseFloat(cp.longitud)]);

  const truckPos = viaje?.posicion_actual || (
    checkpointsConCoords.length > 0
      ? {
          latitud: parseFloat(checkpointsConCoords[checkpointsConCoords.length - 1].latitud),
          longitud: parseFloat(checkpointsConCoords[checkpointsConCoords.length - 1].longitud),
          fecha_actualizacion: checkpointsConCoords[checkpointsConCoords.length - 1].fecha_evento,
          velocidad: null
        }
      : (viaje?.tienda_latitud && viaje?.tienda_longitud && viaje?.estado === 'entregado')
      ? {
          latitud: parseFloat(viaje.tienda_latitud),
          longitud: parseFloat(viaje.tienda_longitud),
          fecha_actualizacion: viaje.fecha_llegada_real,
          velocidad: 0
        }
      : {
          latitud: 14.6349,
          longitud: -90.5069,
          fecha_actualizacion: viaje?.fecha_plan_salida,
          velocidad: 0
        }
  );

  const truckCoordinates = truckPos && truckPos.latitud && truckPos.longitud
    ? [parseFloat(truckPos.latitud), parseFloat(truckPos.longitud)]
    : [14.6349, -90.5069];

  const handleCenterTruck = () => {
    if (truckCoordinates) {
      setFlyTarget([truckCoordinates[0], truckCoordinates[1], Date.now()]);
    }
  };

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
      <div className="page-header flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="flex align-items-center gap-3">
          <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => navigate('/viajes')} />
          <div>
            <h1 className="text-2xl font-bold m-0 flex align-items-center gap-2">
              <i className="pi pi-truck text-primary"></i>
              Viaje — Placas: {viaje.placa_vehiculo}
            </h1>
            <div className="flex align-items-center gap-2 mt-2 mb-0 flex-wrap">
              <span className="text-500 text-sm font-semibold">ID de Viaje:</span>
              <span className="font-mono text-xs md:text-sm bg-surface-100 px-2 py-1 border-round border-1 surface-border select-all font-bold text-900 tracking-wide">
                {viaje.id}
              </span>
              <Button
                icon="pi pi-copy"
                className="p-button-text p-button-sm p-0 w-2rem h-2rem text-500 hover:text-primary"
                tooltip="Copiar ID completo"
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                  navigator.clipboard.writeText(viaje.id);
                  showSuccess('ID de viaje copiado al portapapeles');
                }}
              />
              <span className="text-400">·</span>
              <span className="text-600 text-sm">
                Destino: <strong>{viaje.nombre_tienda}</strong> ({viaje.pais_destino})
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 align-items-center flex-wrap">
          <Tag severity={estadoSeverity[viaje.estado]} value={estadoLabels[viaje.estado] || viaje.estado} className="text-base px-3 py-2 font-bold" />
          {!isPiloto && (
            <>
              <Button label="Costos del Viaje" icon="pi pi-dollar" severity="warning" outlined onClick={() => setGastosDialogVisible(true)} />
              <Button label="Auditoría (PDF)" icon="pi pi-file-pdf" severity="help" outlined loading={downloadingPdf} onClick={handleDownloadPDF} tooltip="Descargar Ficha de Auditoría Oficial" />
              <Button label="Registrar Checkpoint" icon="pi pi-plus" onClick={openCheckpointDialog} />
            </>
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
            <div className="text-500 text-sm mb-1">Piloto Asignado</div>
            <div className="font-semibold text-900">{viaje.nombre_piloto || 'Sin piloto asignado'}</div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Vehículo / Placa</div>
            <div className="font-semibold text-900">{viaje.placa_vehiculo}</div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Contenedor</div>
            <div className="font-semibold text-900">{viaje.numero_contenedor || 'N/A'}</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card>
            <div className="text-500 text-sm mb-1">Costos Totales / Sobrecostos</div>
            <div className="font-bold text-lg text-primary">
              ${(gastos.total_gasto || (gastos.flete_base + (gastos.multas_aduana||0) + (gastos.viaticos_extra||0) + (gastos.parqueo_almacenaje||0))).toFixed(2)}
            </div>
            <span className="text-xs text-orange-500 font-semibold">
              Sobrecostos: ${(gastos.total_sobrecostos || ((gastos.multas_aduana||0) + (gastos.viaticos_extra||0) + (gastos.parqueo_almacenaje||0))).toFixed(2)}
            </span>
          </Card>
        </div>
      </div>

      <div className="grid">
        {/* Mapa con ruta y camión actual */}
        <div className="col-12 lg:col-7">
          <Card
            title={
              <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-lg font-bold flex align-items-center gap-2">
                  <i className="pi pi-map text-primary"></i>
                  Ubicación Satelital & Ruta del Camión
                </span>
                <Button
                  label="Centrar en Camión"
                  icon="pi pi-compass"
                  size="small"
                  outlined
                  onClick={handleCenterTruck}
                  className="font-semibold"
                />
              </div>
            }
          >
            <MapContainer
              center={truckCoordinates}
              zoom={8}
              style={{ height: '52vh', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyToLocation target={flyTarget ? [flyTarget[0], flyTarget[1]] : null} />

              {/* Línea de ruta recorrida */}
              {routePositions.length > 1 && (
                <Polyline positions={routePositions} color="#3b82f6" weight={4} opacity={0.8} />
              )}

              {/* Proyección hacia tienda si no está entregado */}
              {viaje.tienda_latitud && viaje.tienda_longitud && viaje.estado !== 'entregado' && (
                <Polyline
                  positions={[truckCoordinates, [parseFloat(viaje.tienda_latitud), parseFloat(viaje.tienda_longitud)]]}
                  pathOptions={{ color: '#059669', weight: 3, dashArray: '8, 8', opacity: 0.6 }}
                />
              )}

              {/* Marcador del Camión en Posición Actual */}
              <Marker
                position={truckCoordinates}
                icon={createTruckMarker(viaje.estado)}
              >
                <Tooltip permanent direction="top" offset={[0, -24]}>
                  🚚 Camión: {viaje.placa_vehiculo} ({estadoLabels[viaje.estado] || viaje.estado})
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: '220px' }} className="p-1">
                    <div className="flex align-items-center gap-2 mb-2 pb-2 border-bottom-1 surface-border">
                      <i className="pi pi-truck text-primary text-xl" />
                      <div>
                        <strong className="block text-base">{viaje.placa_vehiculo}</strong>
                        <span className="text-xs text-500">Unidad de Transporte Principal</span>
                      </div>
                    </div>
                    <div className="text-sm flex flex-column gap-1">
                      <div>
                        <strong>Estado actual:</strong>{' '}
                        <Tag severity={estadoSeverity[viaje.estado]} value={estadoLabels[viaje.estado] || viaje.estado} className="text-xs ml-1" />
                      </div>
                      <div><strong>Piloto:</strong> {viaje.nombre_piloto || 'Asignado'}</div>
                      <div><strong>Destino:</strong> {viaje.nombre_tienda} ({viaje.pais_destino})</div>
                      {truckPos?.velocidad != null && (
                        <div><strong>Velocidad reportada:</strong> {truckPos.velocidad} km/h</div>
                      )}
                      <div className="text-xs text-500 mt-1">
                        <strong>Coordenadas GPS:</strong> {truckCoordinates[0].toFixed(4)}, {truckCoordinates[1].toFixed(4)}
                      </div>
                      {truckPos?.fecha_actualizacion && (
                        <small className="text-400 mt-1 block">
                          Último reporte: {new Date(truckPos.fecha_actualizacion).toLocaleString('es-GT')}
                        </small>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Marcadores de checkpoints previos */}
              {checkpointsConCoords.map((cp) => (
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

              {/* Marcador de Tienda Destino */}
              {viaje.tienda_latitud && viaje.tienda_longitud && (
                <Marker
                  position={[parseFloat(viaje.tienda_latitud), parseFloat(viaje.tienda_longitud)]}
                  icon={storeIcon}
                >
                  <Tooltip direction="bottom" offset={[0, 18]}>
                    🏪 Destino: {viaje.nombre_tienda}
                  </Tooltip>
                  <Popup>
                    <div className="p-1">
                      <strong>Punto de Entrega Final</strong>
                      <br />
                      <span>{viaje.nombre_tienda} ({viaje.pais_destino})</span>
                      {viaje.direccion_tienda && <p className="text-xs text-500 m-0 mt-1">{viaje.direccion_tienda}</p>}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </Card>
        </div>

        {/* Timeline de checkpoints */}
        <div className="col-12 lg:col-5">
          <Card
            title={
              <div className="flex justify-content-between align-items-center">
                <span className="text-lg font-bold flex align-items-center gap-2">
                  <i className="pi pi-history text-primary"></i>
                  Historial de Eventos
                </span>
                <Tag severity="info" value={`${checkpoints.length} registros`} />
              </div>
            }
          >
            <div style={{ maxHeight: '52vh', overflowY: 'auto', paddingRight: '4px' }}>
              {checkpoints.length === 0 ? (
                <div className="text-center text-500 p-4">
                  <i className="pi pi-clock text-4xl mb-2 text-300" style={{ display: 'block' }} />
                  <p className="m-0 font-medium">No hay checkpoints registrados aún</p>
                  <span className="text-xs text-400">Los eventos se registrarán a medida que el viaje avance</span>
                </div>
              ) : (
                <Timeline
                  value={checkpoints}
                  marker={timelineMarker}
                  content={timelineContent}
                  className="customized-timeline w-full"
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

      {/* Dialog Registro y Totalización de Gastos de Viaje */}
      <Dialog
        visible={gastosDialogVisible}
        style={{ width: '600px' }}
        header="Registro de Costos Logísticos y Sobrecostos"
        modal
        className="p-fluid"
        onHide={() => setGastosDialogVisible(false)}
        footer={(
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setGastosDialogVisible(false)} />
            <Button label="Guardar y Totalizar" icon="pi pi-check" onClick={handleSaveGastos} loading={savingGastos} />
          </div>
        )}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="field">
            <label htmlFor="flete_base" className="font-bold">Flete Base (Tarifa Pactada USD)</label>
            <InputNumber
              id="flete_base"
              value={gastos.flete_base}
              onValueChange={(e) => setGastos({ ...gastos, flete_base: e.value || 0 })}
              mode="currency"
              currency="USD"
              locale="en-US"
            />
          </div>

          <h4 className="m-0 text-orange-500 font-bold border-bottom-1 border-300 pb-2">Sobrecostos e Imprevistos Operativos</h4>

          <div className="grid formgrid">
            <div className="col-12 md:col-6 field">
              <label htmlFor="multas_aduana" className="font-semibold text-sm">Multas / Errores de Papeleo (DUCA/Aduanas)</label>
              <InputNumber
                id="multas_aduana"
                value={gastos.multas_aduana}
                onValueChange={(e) => setGastos({ ...gastos, multas_aduana: e.value || 0 })}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>

            <div className="col-12 md:col-6 field">
              <label htmlFor="viaticos_extra" className="font-semibold text-sm">Viáticos Extra (Piloto / Demoras)</label>
              <InputNumber
                id="viaticos_extra"
                value={gastos.viaticos_extra}
                onValueChange={(e) => setGastos({ ...gastos, viaticos_extra: e.value || 0 })}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>

            <div className="col-12 md:col-6 field">
              <label htmlFor="parqueo_almacenaje" className="font-semibold text-sm">Parqueo / Almacenaje en Frontera</label>
              <InputNumber
                id="parqueo_almacenaje"
                value={gastos.parqueo_almacenaje}
                onValueChange={(e) => setGastos({ ...gastos, parqueo_almacenaje: e.value || 0 })}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>

            <div className="col-12 md:col-6 field">
              <label htmlFor="otros_imprevistos" className="font-semibold text-sm">Otros Sobrecostos</label>
              <InputNumber
                id="otros_imprevistos"
                value={gastos.otros_imprevistos}
                onValueChange={(e) => setGastos({ ...gastos, otros_imprevistos: e.value || 0 })}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="gastos_notas" className="font-semibold text-sm">Notas y Justificación de Sobrecostos</label>
            <InputTextarea
              id="gastos_notas"
              value={gastos.notas}
              onChange={(e) => setGastos({ ...gastos, notas: e.target.value })}
              rows={2}
              placeholder="Ej: Retención por revisión exhaustiva de DUCA en frontera..."
            />
          </div>

          {/* Resumen Totalizador */}
          <div className="surface-ground p-3 border-round flex justify-content-between align-items-center mt-2">
            <div>
              <span className="text-500 text-sm block">Total Sobrecostos Imprevistos:</span>
              <span className="text-xl font-bold text-red-500">
                ${((gastos.multas_aduana || 0) + (gastos.viaticos_extra || 0) + (gastos.parqueo_almacenaje || 0) + (gastos.otros_imprevistos || 0)).toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-500 text-sm block">Costo Total del Viaje:</span>
              <span className="text-2xl font-bold text-primary">
                ${((gastos.flete_base || 0) + (gastos.multas_aduana || 0) + (gastos.viaticos_extra || 0) + (gastos.parqueo_almacenaje || 0) + (gastos.otros_imprevistos || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
