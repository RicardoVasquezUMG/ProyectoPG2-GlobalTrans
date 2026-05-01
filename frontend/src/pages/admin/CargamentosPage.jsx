import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import { getCargamentos, createCargamento, updateCargamento, deleteCargamento, getDocumentosCargamento, uploadDocumentoCargamento, deleteDocumentoCargamento } from '../../api/cargamentosApi';
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
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [docsDialogVisible, setDocsDialogVisible] = useState(false);
  
  const emptyCargamento = { furgon_id: '', campania_id: '' };
  const [newCargamento, setNewCargamento] = useState({ ...emptyCargamento });
  const [editingCargamento, setEditingCargamento] = useState(null);
  
  const [selectedCargamento, setSelectedCargamento] = useState(null);
  const [cargamentoDocs, setCargamentoDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const { showSuccess, showError } = useToast();

  const estadosPermitidos = [
    { label: 'Creado', value: 'creado' },
    { label: 'Procesando', value: 'procesando' },
    { label: 'Preparado', value: 'preparado' },
    { label: 'Conciliado', value: 'conciliado' }
  ];

  const documentTypes = [
    { label: 'Factura', value: 'Factura' },
    { label: 'Guía', value: 'Guía' },
    { label: 'Manifiesto', value: 'Manifiesto' },
    { label: 'Otro', value: 'Otro' }
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
  const hideCreateDialog = () => setCreateDialogVisible(false);

  const openEditDialog = (cargamento) => {
    setEditingCargamento({ id: cargamento.id, estado: cargamento.estado });
    setEditDialogVisible(true);
  };
  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingCargamento(null);
  };

  const openUploadDialog = (cargamento) => {
    setSelectedCargamento(cargamento);
    setDocumentType('');
    setUploadDialogVisible(true);
  };
  const hideUploadDialog = () => {
    setUploadDialogVisible(false);
    setSelectedCargamento(null);
    setDocumentType('');
    setSelectedFile(null);
  };

  const openDocsDialog = async (cargamento) => {
    setSelectedCargamento(cargamento);
    setDocsDialogVisible(true);
    try {
      setLoadingDocs(true);
      const docs = await getDocumentosCargamento(cargamento.id);
      setCargamentoDocs(docs);
    } catch (error) {
      showError('Error al cargar documentos');
    } finally {
      setLoadingDocs(false);
    }
  };
  const hideDocsDialog = () => {
    setDocsDialogVisible(false);
    setSelectedCargamento(null);
    setCargamentoDocs([]);
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

  const handleCustomUpload = async () => {
    if (!documentType) {
      showError('Debe seleccionar el tipo de documento');
      return;
    }
    if (!selectedFile) {
      showError('Debe seleccionar un archivo PDF');
      return;
    }
    setSaving(true);
    try {
      await uploadDocumentoCargamento(selectedCargamento.id, selectedFile, documentType);
      showSuccess('Documento subido exitosamente');
      hideUploadDialog();
      loadData(); // Refrescar para ver los nuevos tags
    } catch (error) {
      showError('Error al subir el documento');
    } finally {
      setSaving(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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

  const confirmDeleteDocument = (documento) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar este documento?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteDocumentoCargamento(documento.id);
          showSuccess('Documento eliminado');
          // Reload docs for this cargamento
          const docs = await getDocumentosCargamento(selectedCargamento.id);
          setCargamentoDocs(docs);
          loadData(); // To update badges in main table
        } catch (error) {
          showError('Error al eliminar el documento');
        }
      }
    });
  };

  const docsTemplate = (rowData) => {
    if (!rowData.documentos || rowData.documentos.length === 0) return <span className="text-500 text-sm">Ninguno</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.documentos.map((tipo, i) => (
          <Tag key={i} value={tipo} severity="info" />
        ))}
      </div>
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-paperclip" rounded outlined className="p-button-sm p-button-help" onClick={() => openUploadDialog(rowData)} tooltip="Adjuntar Documento" />
        <Button icon="pi pi-eye" rounded outlined className="p-button-sm p-button-secondary" onClick={() => openDocsDialog(rowData)} tooltip="Ver Documentos" />
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

  const docActionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-external-link" rounded outlined className="p-button-sm" onClick={() => window.open(rowData.url, '_blank')} tooltip="Abrir PDF" />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDeleteDocument(rowData)} tooltip="Eliminar Documento" />
      </div>
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
        <Column header="Documentos" body={docsTemplate} />
        <Column field="fecha_creacion" header="Fecha Creación" body={(r) => dateTemplate(r.fecha_creacion)} sortable />
        <Column field="fecha_cierre" header="Fecha Cierre" body={(r) => dateTemplate(r.fecha_cierre)} sortable />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
      </DataTable>

      {/* Dialog Nuevo Cargamento */}
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
            <Dropdown id="furgon" value={newCargamento.furgon_id} options={furgones} optionLabel="numero_contenedor" optionValue="id" onChange={(e) => setNewCargamento({ ...newCargamento, furgon_id: e.value })} placeholder="Seleccionar Furgón" />
          </div>
          <div className="field">
            <label htmlFor="campania" className="font-bold">Campaña</label>
            <Dropdown id="campania" value={newCargamento.campania_id} options={campanias} optionLabel="descripcion" optionValue="id" onChange={(e) => setNewCargamento({ ...newCargamento, campania_id: e.value })} placeholder="Seleccionar Campaña" />
          </div>
        </div>
      </Dialog>

      {/* Dialog Editar Estado */}
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
              <Dropdown id="estado" value={editingCargamento.estado} options={estadosPermitidos} onChange={(e) => setEditingCargamento({ ...editingCargamento, estado: e.value })} placeholder="Seleccionar Estado" />
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog Adjuntar Documento */}
      <Dialog
        visible={uploadDialogVisible}
        style={{ width: '450px' }}
        header="Adjuntar Documento"
        modal
        className="p-fluid"
        onHide={hideUploadDialog}
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideUploadDialog} disabled={saving} />
            <Button label="Subir Documento" icon="pi pi-upload" onClick={handleCustomUpload} loading={saving} disabled={!selectedFile || !documentType} />
          </>
        )}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="field">
            <label htmlFor="tipo_doc" className="font-bold">Tipo de Documento</label>
            <Dropdown id="tipo_doc" value={documentType} options={documentTypes} onChange={(e) => setDocumentType(e.value)} placeholder="Seleccionar Tipo" />
          </div>
          <div className="field">
            <label className="font-bold">Archivo PDF</label>
            <div 
              className="border-2 border-dashed border-round p-5 text-center cursor-pointer flex flex-column align-items-center justify-content-center"
              style={{ borderColor: 'var(--primary-color)', minHeight: '180px', backgroundColor: 'var(--surface-ground)' }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="application/pdf" />
              {selectedFile ? (
                <>
                  <i className="pi pi-file-pdf text-6xl text-primary mb-3"></i>
                  <span className="font-bold text-lg text-primary">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <i className="pi pi-cloud-upload text-6xl text-500 mb-3"></i>
                  <span className="text-500 font-bold mb-1">Arrastre y suelte un archivo PDF aquí</span>
                  <span className="text-500 text-sm">o haga clic para seleccionar desde su PC</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog Ver Documentos */}
      <Dialog
        visible={docsDialogVisible}
        style={{ width: '700px' }}
        header={`Documentos del Cargamento ${selectedCargamento?.numero_contenedor || ''}`}
        modal
        onHide={hideDocsDialog}
      >
        <DataTable value={cargamentoDocs} loading={loadingDocs} emptyMessage="No hay documentos adjuntos.">
          <Column field="tipo" header="Tipo" sortable />
          <Column field="fecha_subida" header="Fecha de Subida" body={(r) => dateTemplate(r.fecha_subida)} sortable />
          <Column header="Acción" body={docActionsTemplate} />
        </DataTable>
      </Dialog>
    </div>
  );
}
