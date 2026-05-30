import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getTiendas, createTienda, updateTienda, deleteTienda } from '../../api/tiendasApi';
import { useToast } from '../../hooks/useToast';
import { FilterMatchMode } from 'primereact/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const countryCoordinates = {
  'Guatemala': [14.6349, -90.5069],
  'Belice': [17.4995, -88.1976],
  'El Salvador': [13.6929, -89.2182],
  'Honduras': [14.0723, -87.1921],
  'Nicaragua': [12.1149, -86.2362],
  'Costa Rica': [9.9281, -84.0907],
  'Panamá': [8.9824, -79.5199]
};

function MapPicker({ lat, lng, onLocationSelect, defaultCenter }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  useEffect(() => {
    if (lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom());
    } else if (defaultCenter) {
      map.setView(defaultCenter, map.getZoom());
    }
  }, [lat, lng, defaultCenter, map]);

  const hasCoords = lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  return hasCoords ? (
    <Marker position={[parseFloat(lat), parseFloat(lng)]} />
  ) : null;
}

export default function TiendasPage() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingTienda, setEditingTienda] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewTienda, setViewTienda] = useState(null);

  const { showSuccess, showError } = useToast();

  const emptyTienda = {
    nombre: '',
    pais: '',
    direccion: '',
    latitud: '',
    longitud: '',
    estado: true
  };

  const countries = [
    'Guatemala',
    'Belice',
    'El Salvador',
    'Honduras',
    'Nicaragua',
    'Costa Rica',
    'Panamá'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tiendasData = await getTiendas();
      setTiendas(tiendasData);
    } catch (error) {
      showError('Error al cargar datos de tiendas');
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h2 className="m-0 text-xl font-bold">Gestión de Tiendas</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
          </span>
          <Button label="Nueva Tienda" icon="pi pi-plus" onClick={openNewDialog} />
        </div>
      </div>
    );
  };

  const openNewDialog = () => {
    setEditingTienda({ ...emptyTienda });
    setIsNew(true);
    setEditDialogVisible(true);
  };

  const openEditDialog = (tienda) => {
    setEditingTienda({ ...tienda });
    setIsNew(false);
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingTienda(null);
  };

  const saveTienda = async () => {
    if (!editingTienda.nombre || !editingTienda.pais || !editingTienda.direccion) {
      showError('Nombre, País y Dirección son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createTienda(editingTienda);
        showSuccess('Tienda creada correctamente');
        setViewTienda(created || editingTienda);
        setViewDialogVisible(true);
      } else {
        await updateTienda(editingTienda.id, editingTienda);
        showSuccess('Tienda actualizada correctamente');
      }
      hideEditDialog();
      loadData();
    } catch (error) {
      showError(isNew ? 'Error al crear la tienda' : 'Error al actualizar la tienda');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (tienda) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar la tienda ${tienda.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteTienda(tienda.id);
          showSuccess('Tienda eliminada');
          loadData();
        } catch (error) {
          showError('Error al eliminar la tienda');
        }
      }
    });
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => openEditDialog(rowData)} tooltip="Editar" />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDelete(rowData)} tooltip="Eliminar" />
      </div>
    );
  };

  const estadoBodyTemplate = (rowData) => {
    return rowData.estado ? 'Activo' : 'Inactivo';
  };

  const idTiendaBodyTemplate = (rowData) => {
    const maxLen = 12;
    const code = rowData.id?.toString() ?? '';
    const display = code.length > maxLen ? `${code.substring(0, maxLen)}...` : code;
    return <span title={code}>{display}</span>;
  };

  return (
    <div className="card">
      <ConfirmDialog />
      <DataTable
        value={tiendas}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['id', 'nombre', 'pais', 'direccion']}
        header={renderHeader()}
        emptyMessage="No se encontraron tiendas."
        stripedRows
      >
        <Column field="id" header="ID Tienda" body={idTiendaBodyTemplate} sortable />
        <Column field="nombre" header="Nombre" sortable />
        <Column field="pais" header="País" sortable />
        <Column field="direccion" header="Dirección" sortable />
        <Column field="latitud" header="Latitud" sortable />
        <Column field="longitud" header="Longitud" sortable />
        <Column field="estado" header="Estado" sortable body={estadoBodyTemplate} />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '900px', maxWidth: '95vw' }}
        header={isNew ? 'Nueva Tienda' : 'Editar Tienda'}
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} disabled={saving} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveTienda} loading={saving} />
          </>
        )}
        onHide={hideEditDialog}
      >
        {editingTienda && (
          <div className="grid formgrid pt-2">
            <div className="col-12 md:col-5 flex flex-column gap-3">
              <div className="field m-0">
                <label htmlFor="nombre" className="font-bold">Nombre *</label>
                <InputText 
                  id="nombre" 
                  value={editingTienda.nombre} 
                  onChange={(e) => setEditingTienda({ ...editingTienda, nombre: e.target.value })} 
                  placeholder="Ej. Tienda Central" 
                  required 
                />
              </div>
              <div className="field m-0">
                <label htmlFor="pais" className="font-bold">País *</label>
                <Dropdown 
                  id="pais" 
                  value={editingTienda.pais} 
                  options={countries}
                  onChange={(e) => setEditingTienda({ ...editingTienda, pais: e.value })} 
                  placeholder="Seleccione un país" 
                  required 
                  className="w-full"
                />
              </div>
              <div className="field m-0">
                <label htmlFor="direccion" className="font-bold">Dirección *</label>
                <InputText 
                  id="direccion" 
                  value={editingTienda.direccion} 
                  onChange={(e) => setEditingTienda({ ...editingTienda, direccion: e.target.value })} 
                  placeholder="Ej. 5ta Avenida..." 
                  required 
                />
              </div>
              <div className="formgrid grid">
                <div className="col-6 field m-0">
                  <label htmlFor="latitud" className="font-bold text-sm">Latitud</label>
                  <InputText 
                    id="latitud" 
                    value={editingTienda.latitud ?? ''} 
                    onChange={(e) => setEditingTienda({ ...editingTienda, latitud: e.target.value })} 
                    placeholder="Ej. 14.6349" 
                  />
                </div>
                <div className="col-6 field m-0">
                  <label htmlFor="longitud" className="font-bold text-sm">Longitud</label>
                  <InputText 
                    id="longitud" 
                    value={editingTienda.longitud ?? ''} 
                    onChange={(e) => setEditingTienda({ ...editingTienda, longitud: e.target.value })} 
                    placeholder="Ej. -90.5069" 
                  />
                </div>
              </div>
              <div className="flex align-items-center gap-2 pt-1">
                <Checkbox 
                  inputId="estado" 
                  checked={editingTienda.estado} 
                  onChange={(e) => setEditingTienda({ ...editingTienda, estado: e.checked })} 
                />
                <label htmlFor="estado" className="cursor-pointer font-medium">Activo</label>
              </div>
            </div>

            <div className="col-12 md:col-7 flex flex-column gap-2">
              <label className="font-bold text-secondary">
                <i className="pi pi-map-marker mr-1 text-primary"></i> Ubicación en el mapa (Haga clic para colocar el Pin):
              </label>
              <div style={{ height: '320px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                <MapContainer
                  center={
                    editingTienda.latitud && editingTienda.longitud
                      ? [parseFloat(editingTienda.latitud), parseFloat(editingTienda.longitud)]
                      : (countryCoordinates[editingTienda.pais] || [14.6349, -90.5069])
                  }
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapPicker
                    lat={editingTienda.latitud}
                    lng={editingTienda.longitud}
                    defaultCenter={countryCoordinates[editingTienda.pais] || [14.6349, -90.5069]}
                    onLocationSelect={(lat, lng) => {
                      setEditingTienda((prev) => ({
                        ...prev,
                        latitud: lat.toFixed(6),
                        longitud: lng.toFixed(6)
                      }));
                    }}
                  />
                </MapContainer>
              </div>
              <span className="text-xs text-500">Al hacer clic en cualquier punto del mapa, se colocará un marcador y los campos de Latitud y Longitud se actualizarán automáticamente.</span>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog para mostrar detalles de la tienda creada */}
      <Dialog
        visible={viewDialogVisible}
        style={{ width: '650px' }}
        header="Detalles de la Tienda Creada"
        modal
        footer={(<Button label="Aceptar" icon="pi pi-check" onClick={() => setViewDialogVisible(false)} />)}
        onHide={() => setViewDialogVisible(false)}
      >
        {viewTienda && (
          <div className="p-fluid" style={{ fontSize: '1.2rem' }}>
            <div className="field"><label className="font-bold">ID Tienda: </label><span>{viewTienda.id}</span></div>
            <div className="field"><label className="font-bold">Nombre: </label><span>{viewTienda.nombre}</span></div>
            <div className="field"><label className="font-bold">País: </label><span>{viewTienda.pais}</span></div>
            <div className="field"><label className="font-bold">Dirección: </label><span>{viewTienda.direccion}</span></div>
            <div className="field"><label className="font-bold">Latitud: </label><span>{viewTienda.latitud || '-'}</span></div>
            <div className="field"><label className="font-bold">Longitud: </label><span>{viewTienda.longitud || '-'}</span></div>
            <div className="field"><label className="font-bold">Estado: </label><span>{viewTienda.estado ? 'Activo' : 'Inactivo'}</span></div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
