import { useState, useEffect } from 'react';
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

  const { showSuccess, showError } = useToast();

  const emptyTienda = {
    nombre: '',
    pais: '',
    direccion: '',
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
      showError('Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createTienda(editingTienda);
        showSuccess('Tienda creada correctamente');
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
        globalFilterFields={['nombre', 'pais', 'direccion']}
        header={renderHeader()}
        emptyMessage="No se encontraron tiendas."
        stripedRows
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="pais" header="País" sortable />
        <Column field="direccion" header="Dirección" sortable />
        <Column field="estado" header="Estado" sortable body={estadoBodyTemplate} />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '450px' }}
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
          <div className="flex flex-column gap-4 pt-2">
            <div className="field">
              <label htmlFor="nombre" className="font-bold">Nombre</label>
              <InputText 
                id="nombre" 
                value={editingTienda.nombre} 
                onChange={(e) => setEditingTienda({ ...editingTienda, nombre: e.target.value })} 
                placeholder="Ej. Tienda Central" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="pais" className="font-bold">País</label>
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
            <div className="field">
              <label htmlFor="direccion" className="font-bold">Dirección</label>
              <InputText 
                id="direccion" 
                value={editingTienda.direccion} 
                onChange={(e) => setEditingTienda({ ...editingTienda, direccion: e.target.value })} 
                placeholder="Ej. 5ta Avenida..." 
                required 
              />
            </div>
            <div className="flex align-items-center gap-2">
              <Checkbox 
                inputId="estado" 
                checked={editingTienda.estado} 
                onChange={(e) => setEditingTienda({ ...editingTienda, estado: e.checked })} 
              />
              <label htmlFor="estado">Activo</label>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
