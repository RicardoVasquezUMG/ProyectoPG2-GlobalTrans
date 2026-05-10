import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getViajes, createViaje, updateViaje, deleteViaje } from '../../api/viajesApi';
import { getCargamentos } from '../../api/cargamentosApi';
import { getVehicles } from '../../api/vehiclesApi';
import { getTiendas } from '../../api/tiendasApi';
import { getPilots } from '../../api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export default function ViajesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPiloto = user?.role === 'LEVEL_3';

  const [viajes, setViajes] = useState([]);
  const [cargamentos, setCargamentos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [pilotos, setPilotos] = useState([]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    fecha_plan_salida: null,
    observaciones: '',
    cargamento_id: '',
    vehiculo_id: '',
    tienda_id: '',
    usuario_id: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
    loadDependencies();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getViajes(isPiloto ? user.id : null);
      setViajes(data);
    } catch (error) {
      showError('Error al cargar la información de viajes');
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [cData, vData, tData, pData] = await Promise.all([
        getCargamentos(),
        getVehicles(),
        getTiendas(),
        getPilots()
      ]);
      setCargamentos(cData);
      setVehiculos(vData);
      setTiendas(tData);
      setPilotos(pData);
    } catch (error) {
      showError('Error al cargar dependencias de viajes');
    }
  };

  const openNew = () => {
    setFormData({
      fecha_plan_salida: null,
      observaciones: '',
      cargamento_id: '',
      vehiculo_id: '',
      tienda_id: '',
      usuario_id: ''
    });
    setIsEdit(false);
    setDialogVisible(true);
  };

  const editViaje = (viaje) => {
    setFormData({
      fecha_plan_salida: new Date(viaje.fecha_plan_salida),
      observaciones: viaje.observaciones || '',
      cargamento_id: viaje.cargamento_id,
      vehiculo_id: viaje.vehiculo_id,
      tienda_id: viaje.tienda_id,
      usuario_id: viaje.usuario_id
    });
    setSelectedId(viaje.id);
    setIsEdit(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const saveViaje = async () => {
    if (!formData.fecha_plan_salida || !formData.cargamento_id || !formData.vehiculo_id || !formData.tienda_id || !formData.usuario_id) {
      showError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      if (isEdit) {
        await updateViaje(selectedId, formData);
        showSuccess('Viaje actualizado exitosamente');
      } else {
        await createViaje(formData);
        showSuccess('Viaje creado exitosamente');
      }
      setDialogVisible(false);
      loadData();
    } catch (error) {
      showError(error.response?.data?.detail || 'Error al guardar el viaje');
    }
  };

  const confirmDelete = (viaje) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar este viaje?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteViaje(viaje.id);
          showSuccess('Viaje eliminado');
          loadData();
        } catch (error) {
          showError('Error al eliminar el viaje');
        }
      }
    });
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" rounded outlined className="p-button-sm" severity="info" onClick={() => navigate(`/viajes/${rowData.id}`)} tooltip="Ver detalle" />
        {!isPiloto && (
          <>
            <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => editViaje(rowData)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDelete(rowData)} />
          </>
        )}
      </div>
    );
  };

  const estadoSeverity = {
    planificado: 'info',
    en_ruta: 'success',
    en_aduana: 'warning',
    entregado: 'success',
    retrasado: 'danger',
    cancelado: 'danger',
  };

  const estadoLabels = {
    planificado: 'Planificado',
    en_ruta: 'En Ruta',
    en_aduana: 'En Aduana',
    entregado: 'Entregado',
    retrasado: 'Retrasado',
    cancelado: 'Cancelado',
  };

  const estadoTemplate = (rowData) => {
    const estado = rowData.estado || 'planificado';
    return <Tag severity={estadoSeverity[estado] || 'info'} value={estadoLabels[estado] || estado} />;
  };

  const dateTemplate = (rowData) => {
    if (!rowData.fecha_plan_salida) return '';
    const dateObj = new Date(rowData.fecha_plan_salida);
    const datePart = dateObj.toLocaleDateString('es-GT');
    const timePart = dateObj.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="flex flex-column">
        <span>{datePart}</span>
        <span className="text-500 text-sm">{timePart}</span>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold m-0">{isPiloto ? 'Mis Viajes' : 'Gestión de Viajes'}</h1>
          <p className="text-500 mt-1 mb-0">{isPiloto ? 'Listado de tus viajes asignados' : 'Asignación de cargamentos a vehículos y pilotos'}</p>
        </div>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="  Buscar..." />
          </span>
          <Button label="Recargar" icon="pi pi-refresh" className="p-button-outlined" onClick={loadData} />
          {!isPiloto && <Button label="Nuevo Viaje" icon="pi pi-plus" onClick={openNew} />}
        </div>
      </div>

      <div className="card">
        <DataTable value={viajes} loading={loading} paginator rows={10} emptyMessage="No se encontraron viajes." globalFilter={globalFilter}>
          <Column field="id" header="ID Viaje" sortable />
          <Column field="cargamento_id" header="ID Cargamento" sortable />
          <Column field="placa_vehiculo" header="Vehículo" sortable />
          <Column field="nombre_piloto" header="Piloto" sortable />
          <Column field="nombre_tienda" header="Destino (Tienda)" sortable />
          <Column field="estado" header="Estado" body={estadoTemplate} sortable />
          <Column field="fecha_plan_salida" header="Fecha Salida" body={dateTemplate} sortable />
          <Column body={actionTemplate} exportable={false} style={{ minWidth: '10rem' }} />
        </DataTable>
      </div>

      <Dialog visible={dialogVisible} style={{ width: '450px' }} header={isEdit ? 'Editar Viaje' : 'Nuevo Viaje'} modal className="p-fluid" onHide={hideDialog}>
        <div className="field flex flex-column">
          <label htmlFor="fecha_plan_salida">Fecha y Hora de Salida *</label>
          <input
            type="datetime-local"
            id="fecha_plan_salida"
            className="p-inputtext p-component"
            value={formData.fecha_plan_salida ? new Date(formData.fecha_plan_salida.getTime() - formData.fecha_plan_salida.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ ...formData, fecha_plan_salida: val ? new Date(val) : null });
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="cargamento_id">Cargamento *</label>
          <Dropdown id="cargamento_id" value={formData.cargamento_id} onChange={(e) => setFormData({ ...formData, cargamento_id: e.value })} options={cargamentos} optionLabel="id" optionValue="id" placeholder="Seleccione un cargamento" filter />
        </div>

        <div className="field">
          <label htmlFor="vehiculo_id">Vehículo *</label>
          <Dropdown id="vehiculo_id" value={formData.vehiculo_id} onChange={(e) => setFormData({ ...formData, vehiculo_id: e.value })} options={vehiculos} optionLabel="placas" optionValue="id" placeholder="Seleccione un vehículo" filter />
        </div>

        <div className="field">
          <label htmlFor="usuario_id">Piloto *</label>
          <Dropdown id="usuario_id" value={formData.usuario_id} onChange={(e) => setFormData({ ...formData, usuario_id: e.value })} options={pilotos} optionLabel="full_name" optionValue="id" placeholder="Seleccione un piloto" filter />
        </div>

        <div className="field">
          <label htmlFor="tienda_id">Tienda Destino *</label>
          <Dropdown id="tienda_id" value={formData.tienda_id} onChange={(e) => setFormData({ ...formData, tienda_id: e.value })} options={tiendas} optionLabel="nombre" optionValue="id" placeholder="Seleccione una tienda" filter />
        </div>

        <div className="field">
          <label htmlFor="observaciones">Observaciones</label>
          <InputTextarea id="observaciones" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} rows={3} />
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
          <Button label="Guardar" icon="pi pi-check" onClick={saveViaje} />
        </div>
      </Dialog>

      <ConfirmDialog />
    </div>
  );
}
