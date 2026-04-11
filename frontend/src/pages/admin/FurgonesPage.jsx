import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getFurgones, createFurgon, updateFurgon, deleteFurgon } from '../../api/furgonesApi';
import { useToast } from '../../hooks/useToast';
import { FilterMatchMode } from 'primereact/api';

export default function FurgonesPage() {
  const [furgones, setFurgones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingFurgon, setEditingFurgon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const { showSuccess, showError } = useToast();

  const emptyFurgon = {
    numero_contenedor: '',
    codigo_tamano_tipo: '',
    peso_bruto_maximo: null,
    peso_tara: null,
    carga_util: null,
    codigo_propietario: ''
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const furgonesData = await getFurgones();
      setFurgones(furgonesData);
    } catch (error) {
      showError('Error al cargar datos de furgones');
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
        <h2 className="m-0 text-xl font-bold">Gestión de Furgones</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="   Buscar..." />
          </span>
          <Button label="Nuevo Furgón" icon="pi pi-plus" onClick={openNewDialog} />
        </div>
      </div>
    );
  };

  const openNewDialog = () => {
    setEditingFurgon({ ...emptyFurgon });
    setIsNew(true);
    setEditDialogVisible(true);
  };

  const openEditDialog = (furgon) => {
    setEditingFurgon({ ...furgon });
    setIsNew(false);
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingFurgon(null);
  };

  const saveFurgon = async () => {
    if (!editingFurgon.numero_contenedor || !editingFurgon.codigo_tamano_tipo || !editingFurgon.codigo_propietario) {
      showError('Los campos de texto son obligatorios');
      return;
    }
    if (editingFurgon.codigo_propietario.length !== 4) {
      showError('El código del propietario debe tener exactamente 4 letras');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createFurgon(editingFurgon);
        showSuccess('Furgón creado correctamente');
      } else {
        await updateFurgon(editingFurgon.id, editingFurgon);
        showSuccess('Furgón actualizado correctamente');
      }
      hideEditDialog();
      loadData();
    } catch (error) {
      showError(isNew ? 'Error al crear el furgón' : 'Error al actualizar el furgón');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (furgon) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar el furgón ${furgon.numero_contenedor}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteFurgon(furgon.id);
          showSuccess('Furgón eliminado');
          loadData();
        } catch (error) {
          showError('Error al eliminar el furgón');
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

  const weightTemplate = (value) => {
    return value ? `${value} t` : '-';
  };

  return (
    <div className="card">
      <ConfirmDialog />
      <DataTable
        value={furgones}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['numero_contenedor', 'codigo_tamano_tipo', 'codigo_propietario']}
        header={renderHeader()}
        emptyMessage="No se encontraron furgones."
        stripedRows
      >
        <Column field="numero_contenedor" header="No. Contenedor" sortable />
        <Column field="codigo_tamano_tipo" header="Size/Type" sortable />
        <Column field="peso_bruto_maximo" header="Max Gross" body={(r) => weightTemplate(r.peso_bruto_maximo)} sortable />
        <Column field="peso_tara" header="Tare Weight" body={(r) => weightTemplate(r.peso_tara)} sortable />
        <Column field="carga_util" header="Payload" body={(r) => weightTemplate(r.carga_util)} sortable />
        <Column field="codigo_propietario" header="Propietario" sortable />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '450px' }}
        header={isNew ? 'Nuevo Furgón' : 'Editar Furgón'}
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} disabled={saving} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveFurgon} loading={saving} />
          </>
        )}
        onHide={hideEditDialog}
      >
        {editingFurgon && (
          <div className="flex flex-column gap-4 pt-2">
            <div className="field">
              <label htmlFor="numero_contenedor" className="font-bold">Número de Contenedor</label>
              <InputText 
                id="numero_contenedor" 
                value={editingFurgon.numero_contenedor} 
                onChange={(e) => setEditingFurgon({ ...editingFurgon, numero_contenedor: e.target.value })} 
                placeholder="Ej. ABCD1234567" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="codigo_tamano_tipo" className="font-bold">Código Size/Type</label>
              <InputText 
                id="codigo_tamano_tipo" 
                value={editingFurgon.codigo_tamano_tipo} 
                onChange={(e) => setEditingFurgon({ ...editingFurgon, codigo_tamano_tipo: e.target.value })} 
                placeholder="Ej. 22G1" 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="codigo_propietario" className="font-bold">Código de Propietario</label>
              <InputText 
                id="codigo_propietario" 
                value={editingFurgon.codigo_propietario} 
                onChange={(e) => setEditingFurgon({ ...editingFurgon, codigo_propietario: e.target.value.toUpperCase() })} 
                placeholder="Ej. MSKU (4 letras)" 
                maxLength={4}
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="peso_bruto_maximo" className="font-bold">Peso Bruto Máximo</label>
              <InputNumber 
                id="peso_bruto_maximo" 
                value={editingFurgon.peso_bruto_maximo} 
                onValueChange={(e) => setEditingFurgon({ ...editingFurgon, peso_bruto_maximo: e.value })} 
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2} 
                suffix=" t" 
              />
            </div>
            <div className="field">
              <label htmlFor="peso_tara" className="font-bold">Peso Tara</label>
              <InputNumber 
                id="peso_tara" 
                value={editingFurgon.peso_tara} 
                onValueChange={(e) => setEditingFurgon({ ...editingFurgon, peso_tara: e.value })} 
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2} 
                suffix=" t" 
              />
            </div>
            <div className="field">
              <label htmlFor="carga_util" className="font-bold">Carga Útil (Payload)</label>
              <InputNumber 
                id="carga_util" 
                value={editingFurgon.carga_util} 
                onValueChange={(e) => setEditingFurgon({ ...editingFurgon, carga_util: e.value })} 
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2} 
                suffix=" t" 
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
