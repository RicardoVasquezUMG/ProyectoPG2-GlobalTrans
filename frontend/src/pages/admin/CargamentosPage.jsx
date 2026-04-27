import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getCargamentos, createCargamento, updateCargamento, deleteCargamento } from '../../api/cargamentosApi';
import { getFurgones } from '../../api/furgonesApi';
import { getCampanias } from '../../api/campaniasApi';
import { useToast } from '../../hooks/useToast';
import { FilterMatchMode } from 'primereact/api';

export default function CargamentosPage() {
  const [cargamentos, setCargamentos] = useState([]);
  const [furgones, setFurgones] = useState([]);
  const [campanias, setCampanias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  
  const emptyCargamento = {
    furgon_id: '',
    campania_id: ''
  };
  const [newCargamento, setNewCargamento] = useState({ ...emptyCargamento });
  
  const [editingCargamento, setEditingCargamento] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  const estadosPermitidos = [
    { label: 'Creado', value: 'creado' },
    { label: 'Procesando', value: 'procesando' },
    { label: 'Preparado', value: 'preparado' },
    { label: 'Conciliado', value: 'conciliado' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cargamentosData, furgonesData, campaniasData] = await Promise.all([
        getCargamentos(),
        getFurgones(),
        getCampanias()
      ]);
      
      setCargamentos(cargamentosData);
      setFurgones(furgonesData);
      setCampanias(campaniasData.filter(c => c.estado === true));
    } catch (error) {
      showError('Error al cargar datos');
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
        <h2 className="m-0 text-xl font-bold">Gestión de Cargamentos</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="   Buscar..." />
          </span>
          <Button label="Nuevo Cargamento" icon="pi pi-plus" onClick={openCreateDialog} />
        </div>
      </div>
    );
  };

  const openCreateDialog = () => {
    setNewCargamento({ ...emptyCargamento });
    setCreateDialogVisible(true);
  };

  const hideCreateDialog = () => {
    setCreateDialogVisible(false);
  };

  const openEditDialog = (cargamento) => {
    setEditingCargamento({ id: cargamento.id, estado: cargamento.estado });
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingCargamento(null);
  };

  const saveNewCargamento = async () => {
    if (!newCargamento.furgon_id || !newCargamento.campania_id) {
      showError('Furgón y Campaña son obligatorios');
      return;
    }

    setSaving(true);
    try {
      await createCargamento(newCargamento);
      showSuccess('Cargamento creado correctamente');
      hideCreateDialog();
      loadData();
    } catch (error) {
      showError('Error al crear el cargamento');
    } finally {
      setSaving(false);
    }
  };

  const saveEditedCargamento = async () => {
    if (!editingCargamento.estado) {
      showError('El estado es obligatorio');
      return;
    }

    setSaving(true);
    try {
      await updateCargamento(editingCargamento.id, { estado: editingCargamento.estado });
      showSuccess('Estado actualizado correctamente');
      hideEditDialog();
      loadData();
    } catch (error) {
      showError('Error al actualizar el estado');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (cargamento) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar este cargamento?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteCargamento(cargamento.id);
          showSuccess('Cargamento eliminado');
          loadData();
        } catch (error) {
          showError('Error al eliminar el cargamento');
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

  const dateTemplate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const estadoBodyTemplate = (rowData) => {
    return (
      <span className={`estado-badge estado-${rowData.estado}`}>
        {rowData.estado.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="card">
      <ConfirmDialog />
      <DataTable
        value={cargamentos}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['numero_contenedor', 'descripcion_campania', 'estado']}
        header={renderHeader()}
        emptyMessage="No se encontraron cargamentos."
        stripedRows
      >
        <Column field="numero_contenedor" header="Furgón (Contenedor)" sortable />
        <Column field="descripcion_campania" header="Campaña" sortable />
        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable />
        <Column field="fecha_creacion" header="Fecha Creación" body={(r) => dateTemplate(r.fecha_creacion)} sortable />
        <Column field="fecha_cierre" header="Fecha Cierre" body={(r) => dateTemplate(r.fecha_cierre)} sortable />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={createDialogVisible}
        style={{ width: '450px' }}
        header="Nuevo Cargamento"
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideCreateDialog} disabled={saving} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveNewCargamento} loading={saving} />
          </>
        )}
        onHide={hideCreateDialog}
      >
        <div className="flex flex-column gap-4 pt-2">
          <div className="field">
            <label htmlFor="furgon" className="font-bold">Furgón</label>
            <Dropdown 
              id="furgon" 
              value={newCargamento.furgon_id} 
              options={furgones} 
              optionLabel="numero_contenedor" 
              optionValue="id"
              onChange={(e) => setNewCargamento({ ...newCargamento, furgon_id: e.value })} 
              placeholder="Seleccionar Furgón" 
            />
          </div>
          <div className="field">
            <label htmlFor="campania" className="font-bold">Campaña</label>
            <Dropdown 
              id="campania" 
              value={newCargamento.campania_id} 
              options={campanias} 
              optionLabel="descripcion" 
              optionValue="id"
              onChange={(e) => setNewCargamento({ ...newCargamento, campania_id: e.value })} 
              placeholder="Seleccionar Campaña" 
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '450px' }}
        header="Editar Estado de Cargamento"
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} disabled={saving} />
            <Button label="Actualizar" icon="pi pi-check" onClick={saveEditedCargamento} loading={saving} />
          </>
        )}
        onHide={hideEditDialog}
      >
        {editingCargamento && (
          <div className="flex flex-column gap-4 pt-2">
            <div className="field">
              <label htmlFor="estado" className="font-bold">Estado</label>
              <Dropdown 
                id="estado" 
                value={editingCargamento.estado} 
                options={estadosPermitidos} 
                onChange={(e) => setEditingCargamento({ ...editingCargamento, estado: e.value })} 
                placeholder="Seleccionar Estado" 
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
