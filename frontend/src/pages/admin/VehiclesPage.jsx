import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../api/vehiclesApi';
import { useToast } from '../../hooks/useToast';
import { FilterMatchMode } from 'primereact/api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const { showSuccess, showError } = useToast();

  const vehicleStates = [
    { label: 'Disponible', value: 'Disponible' },
    { label: 'En Mantenimiento', value: 'Mantenimiento' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  const emptyVehicle = {
    tipo: '',
    tonelaje: null,
    placas: '',
    estado: 'Disponible'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      showError('Error al cargar datos de vehículos');
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
        <h2 className="m-0 text-xl font-bold">Gestión de Vehículos</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="   Buscar..." />
          </span>
          <Button label="Nuevo Vehículo" icon="pi pi-plus" onClick={openNewDialog} />
        </div>
      </div>
    );
  };

  const openNewDialog = () => {
    setEditingVehicle({ ...emptyVehicle });
    setIsNew(true);
    setEditDialogVisible(true);
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle({ ...vehicle });
    setIsNew(false);
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingVehicle(null);
  };

  const saveVehicle = async () => {
    if (!editingVehicle.tipo || !editingVehicle.tonelaje || !editingVehicle.placas) {
      showError('Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createVehicle(editingVehicle);
        showSuccess('Vehículo creado correctamente');
      } else {
        await updateVehicle(editingVehicle.id, {
          tipo: editingVehicle.tipo,
          tonelaje: editingVehicle.tonelaje,
          placas: editingVehicle.placas,
          estado: editingVehicle.estado
        });
        showSuccess('Vehículo actualizado correctamente');
      }
      hideEditDialog();
      loadData();
    } catch (error) {
      showError(isNew ? 'Error al crear el vehículo' : 'Error al actualizar el vehículo');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (vehicle) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar el vehículo con placas ${vehicle.placas}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteVehicle(vehicle.id);
          showSuccess('Vehículo eliminado');
          loadData();
        } catch (error) {
          showError('Error al eliminar el vehículo');
        }
      }
    });
  };

  // Templates para columnas
  const statusBodyTemplate = (rowData) => {
    let severity = 'info';
    if (rowData.estado === 'Disponible') severity = 'success';
    if (rowData.estado === 'Inactivo') severity = 'danger';
    if (rowData.estado === 'Mantenimiento') severity = 'warning';

    return <Tag value={rowData.estado} severity={severity} />;
  };

  const tonelajeBodyTemplate = (rowData) => {
    return `${rowData.tonelaje} t`;
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => openEditDialog(rowData)} tooltip="Editar" />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDelete(rowData)} tooltip="Eliminar" />
      </div>
    );
  };

  return (
    <div className="card">
      <ConfirmDialog />
      <DataTable
        value={vehicles}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['tipo', 'placas', 'estado']}
        header={renderHeader()}
        emptyMessage="No se encontraron vehículos."
        stripedRows
      >
        <Column field="tipo" header="Tipo" sortable />
        <Column field="placas" header="Placas" sortable />
        <Column field="tonelaje" header="Tonelaje" body={tonelajeBodyTemplate} sortable />
        <Column header="Estado" body={statusBodyTemplate} sortable sortField="estado" />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '450px' }}
        header={isNew ? 'Nuevo Vehículo' : 'Editar Vehículo'}
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} disabled={saving} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveVehicle} loading={saving} />
          </>
        )}
        onHide={hideEditDialog}
      >
        {editingVehicle && (
          <div className="flex flex-column gap-4 pt-2">
            <div className="field">
              <label htmlFor="tipo" className="font-bold">Tipo de Vehículo</label>
              <InputText 
                id="tipo" 
                value={editingVehicle.tipo} 
                onChange={(e) => setEditingVehicle({ ...editingVehicle, tipo: e.target.value })} 
                placeholder="Ej. Camión, Furgón" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="placas" className="font-bold">Placas</label>
              <InputText 
                id="placas" 
                value={editingVehicle.placas} 
                onChange={(e) => setEditingVehicle({ ...editingVehicle, placas: e.target.value })} 
                placeholder="Ej. C-123ABC" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="tonelaje" className="font-bold">Tonelaje</label>
              <InputNumber 
                id="tonelaje" 
                value={editingVehicle.tonelaje} 
                onValueChange={(e) => setEditingVehicle({ ...editingVehicle, tonelaje: e.value })} 
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2} 
                suffix=" t" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="estado" className="font-bold">Estado</label>
              <Dropdown
                id="estado"
                value={editingVehicle.estado}
                options={vehicleStates}
                onChange={(e) => setEditingVehicle({ ...editingVehicle, estado: e.value })}
                placeholder="Seleccione el estado"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
