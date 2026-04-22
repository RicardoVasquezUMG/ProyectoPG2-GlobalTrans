import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { getCampanias, createCampania, updateCampania, deleteCampania } from '../../api/campaniasApi';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { format } from 'date-fns';

export default function CampaniasPage() {
  const [campanias, setCampanias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [editingCampania, setEditingCampania] = useState(null);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const emptyCampania = {
    fecha_inicio: null,
    fecha_fin: null,
    descripcion: '',
    estado: true
  };

  useEffect(() => {
    loadCampanias();
  }, []);

  const loadCampanias = async () => {
    try {
      setLoading(true);
      const data = await getCampanias();
      // Parse dates
      const parsedData = data.map(item => ({
        ...item,
        fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio) : null,
        fecha_fin: item.fecha_fin ? new Date(item.fecha_fin) : null
      }));
      setCampanias(parsedData);
    } catch (error) {
      showError('Error al cargar datos de campañas');
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingCampania({ ...emptyCampania });
    setShowDialog(true);
  };

  const openEditDialog = (campania) => {
    setEditingCampania({ ...campania });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCampania(null);
  };

  const saveCampania = async () => {
    if (!editingCampania.fecha_inicio || !editingCampania.fecha_fin || !editingCampania.descripcion) {
      showError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...editingCampania,
        fecha_inicio: format(editingCampania.fecha_inicio, 'yyyy-MM-dd'),
        fecha_fin: format(editingCampania.fecha_fin, 'yyyy-MM-dd'),
      };

      if (editingCampania.id) {
        await updateCampania(editingCampania.id, payload);
        showSuccess('Campaña actualizada exitosamente');
      } else {
        await createCampania(payload);
        showSuccess('Campaña creada exitosamente');
      }
      closeDialog();
      loadCampanias();
    } catch (error) {
      showError(error.response?.data?.detail || 'Error al guardar la campaña');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (campania) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar la campaña "${campania.descripcion}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteCampania(campania.id);
          showSuccess('Campaña eliminada exitosamente');
          loadCampanias();
        } catch (error) {
          showError('Error al eliminar la campaña');
        }
      }
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => openEditDialog(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
      </div>
    );
  };

  const dateBodyTemplate = (rowData, field) => {
    return rowData[field] ? format(rowData[field], 'dd/MM/yyyy') : '';
  };

  const estadoBodyTemplate = (rowData) => {
    return rowData.estado ? 'Activo' : 'Inactivo';
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 text-xl font-bold">Gestión de Campañas</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="  Buscar..." />
          </span>
          <Button label="Nueva Campaña" icon="pi pi-plus" onClick={openNewDialog} />
        </div>
      </div>

      <DataTable
        value={campanias}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['descripcion']}
        responsiveLayout="scroll"
        emptyMessage="No se encontraron campañas."
      >
        <Column field="descripcion" header="Descripción" sortable />
        <Column field="fecha_inicio" header="Fecha Inicio" sortable body={(row) => dateBodyTemplate(row, 'fecha_inicio')} />
        <Column field="fecha_fin" header="Fecha Fin" sortable body={(row) => dateBodyTemplate(row, 'fecha_fin')} />
        <Column field="estado" header="Estado" sortable body={estadoBodyTemplate} />
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={showDialog}
        style={{ width: '450px' }}
        header={editingCampania?.id ? 'Editar Campaña' : 'Nueva Campaña'}
        modal
        onHide={closeDialog}
        footer={(
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={closeDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCampania} loading={saving} />
          </div>
        )}
      >
        {editingCampania && (
          <div className="flex flex-column gap-4 mt-2">
            <div className="flex flex-column gap-2">
              <label htmlFor="descripcion">Descripción</label>
              <InputText
                id="descripcion"
                value={editingCampania.descripcion}
                onChange={(e) => setEditingCampania({ ...editingCampania, descripcion: e.target.value })}
              />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="fecha_inicio">Fecha Inicio</label>
              <Calendar
                id="fecha_inicio"
                value={editingCampania.fecha_inicio}
                onChange={(e) => setEditingCampania({ ...editingCampania, fecha_inicio: e.value })}
                dateFormat="dd/mm/yy"
                showIcon
              />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="fecha_fin">Fecha Fin</label>
              <Calendar
                id="fecha_fin"
                value={editingCampania.fecha_fin}
                onChange={(e) => setEditingCampania({ ...editingCampania, fecha_fin: e.value })}
                dateFormat="dd/mm/yy"
                showIcon
              />
            </div>

            <div className="flex align-items-center gap-2 mt-2">
              <Checkbox
                inputId="estado"
                checked={editingCampania.estado}
                onChange={(e) => setEditingCampania({ ...editingCampania, estado: e.checked })}
              />
              <label htmlFor="estado">Activo</label>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog />
    </div>
  );
}
