import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getViajes, createViaje, updateViaje, deleteViaje, getGastosViaje, saveGastosViaje } from '../../api/viajesApi';
import { getCargamentos } from '../../api/cargamentosApi';
import { getVehicles } from '../../api/vehiclesApi';
import { getTiendas } from '../../api/tiendasApi';
import { getPilots } from '../../api/usersApi';
import { getFichaAuditoriaViaje } from '../../api/reportsApi';
import { exportFichaViajePDF } from '../../utils/pdfGenerator';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

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
    fecha_esperada_llegada: null,
    observaciones: '',
    cargamento_id: '',
    vehiculo_id: '',
    tienda_id: '',
    usuario_id: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewViaje, setViewViaje] = useState(null);

  // Estados para Registro de Costos de Viaje
  const [gastosDialogVisible, setGastosDialogVisible] = useState(false);
  const [selectedViajeForGastos, setSelectedViajeForGastos] = useState(null);
  const [gastosForm, setGastosForm] = useState({
    flete_base: 0,
    multas_aduana: 0,
    viaticos_extra: 0,
    parqueo_almacenaje: 0,
    otros_imprevistos: 0,
    notas: ''
  });
  const [savingGastos, setSavingGastos] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);

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
      fecha_esperada_llegada: null,
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
      fecha_plan_salida: viaje.fecha_plan_salida ? new Date(viaje.fecha_plan_salida) : null,
      fecha_esperada_llegada: viaje.fecha_esperada_llegada ? new Date(viaje.fecha_esperada_llegada) : null,
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
        const created = await createViaje(formData);
        showSuccess('Viaje creado exitosamente');
        setViewViaje(created);
        setViewDialogVisible(true);
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

  // --- Manejo de Costos y Gastos de Viaje ---
  const openGastosModal = async (viaje) => {
    setSelectedViajeForGastos(viaje);
    try {
      const g = await getGastosViaje(viaje.id);
      if (g) {
        setGastosForm({
          flete_base: g.flete_base || 0,
          multas_aduana: g.multas_aduana || 0,
          viaticos_extra: g.viaticos_extra || 0,
          parqueo_almacenaje: g.parqueo_almacenaje || 0,
          otros_imprevistos: g.otros_imprevistos || 0,
          notas: g.notas || ''
        });
      } else {
        setGastosForm({
          flete_base: viaje.flete_base || 1000,
          multas_aduana: viaje.multas_aduana || 0,
          viaticos_extra: viaje.viaticos_extra || 0,
          parqueo_almacenaje: viaje.parqueo_almacenaje || 0,
          otros_imprevistos: viaje.otros_imprevistos || 0,
          notas: ''
        });
      }
      setGastosDialogVisible(true);
    } catch (e) {
      setGastosForm({
        flete_base: 1000,
        multas_aduana: 0,
        viaticos_extra: 0,
        parqueo_almacenaje: 0,
        otros_imprevistos: 0,
        notas: ''
      });
      setGastosDialogVisible(true);
    }
  };

  const handleSaveGastos = async () => {
    if (!selectedViajeForGastos) return;
    try {
      setSavingGastos(true);
      await saveGastosViaje(selectedViajeForGastos.id, gastosForm);
      showSuccess('Costos y sobrecostos operativos actualizados exitosamente');
      setGastosDialogVisible(false);
      loadData();
    } catch (e) {
      showError('Error al guardar los costos operativos');
    } finally {
      setSavingGastos(false);
    }
  };

  // Descarga de PDF de Auditoría de Viaje
  const handleDownloadFicha = async (viajeId) => {
    try {
      setDownloadingPdfId(viajeId);
      const ficha = await getFichaAuditoriaViaje(viajeId);
      await exportFichaViajePDF(ficha);
      showSuccess('Guía de auditoría descargada exitosamente en formato PDF');
    } catch (e) {
      showError('Error al generar la guía de auditoría en PDF');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2 align-items-center">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          className="p-button-sm"
          severity="info"
          onClick={() => navigate(`/viajes/${rowData.id}`)}
          tooltip="Ver detalle y GPS"
        />
        {!isPiloto && (
          <>
            <Button
              icon="pi pi-dollar"
              rounded
              outlined
              className="p-button-sm"
              severity="warning"
              onClick={() => openGastosModal(rowData)}
              tooltip="Gestionar costos y sobrecostos"
            />
            <Button
              icon="pi pi-file-pdf"
              rounded
              outlined
              className="p-button-sm"
              severity="help"
              loading={downloadingPdfId === rowData.id}
              onClick={() => handleDownloadFicha(rowData.id)}
              tooltip="Descargar Guía de Auditoría (PDF)"
            />
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              className="p-button-sm"
              onClick={() => editViaje(rowData)}
              tooltip="Editar viaje"
            />
            <Button
              icon="pi pi-trash"
              rounded
              outlined
              severity="danger"
              className="p-button-sm"
              onClick={() => confirmDelete(rowData)}
              tooltip="Eliminar viaje"
            />
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

  const idViajeBodyTemplate = (rowData) => {
    const maxLen = 10;
    const code = rowData.id?.toString() ?? '';
    const display = code.length > maxLen ? `${code.substring(0, maxLen)}...` : code;
    return <span className="font-mono text-xs font-semibold" title={code}>{display}</span>;
  };

  const costoBodyTemplate = (rowData) => {
    const totalGasto = rowData.total_gasto || (rowData.flete_base ? rowData.flete_base + (rowData.total_sobrecostos || 0) : 0);
    const sobrecostos = rowData.total_sobrecostos || 0;

    if (!totalGasto) {
      return <span className="text-400 text-sm italic">Sin costos</span>;
    }

    return (
      <div className="flex flex-column">
        <span className="font-bold text-900">${totalGasto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        {sobrecostos > 0 ? (
          <span className="text-xs text-red-500 font-semibold flex align-items-center gap-1">
            <i className="pi pi-exclamation-circle text-xs"></i>
            +${sobrecostos.toLocaleString()} sobrecosto
          </span>
        ) : (
          <span className="text-xs text-green-600 font-medium">Tarifa base estándar</span>
        )}
      </div>
    );
  };

  // Cálculos en vivo para el modal de costos
  const liveSobrecostos = (gastosForm.multas_aduana || 0) + (gastosForm.viaticos_extra || 0) + (gastosForm.parqueo_almacenaje || 0) + (gastosForm.otros_imprevistos || 0);
  const liveTotalGasto = (gastosForm.flete_base || 0) + liveSobrecostos;
  const liveRatioPct = gastosForm.flete_base > 0 ? Math.round((liveSobrecostos / gastosForm.flete_base) * 100) : 0;

  return (
    <div className="page-container p-4">
      <div className="page-header flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold m-0 flex align-items-center gap-2">
            <i className="pi pi-compass text-primary text-3xl"></i>
            {isPiloto ? 'Mis Viajes Asignados' : 'Gestión de Viajes & Costos Logísticos'}
          </h1>
          <p className="text-500 mt-1 mb-0">
            {isPiloto ? 'Tus rutas, seguimiento GPS y novedades' : 'Control de asignaciones, seguimiento fronterizo y liquidación de costos operativos'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="  Buscar viaje, tienda o piloto..." />
          </span>
          <Button label="Recargar" icon="pi pi-refresh" className="p-button-outlined" onClick={loadData} />
          {!isPiloto && <Button label="Nuevo Viaje" icon="pi pi-plus" onClick={openNew} />}
        </div>
      </div>

      <div className="card shadow-2 border-round-xl">
        <DataTable
          value={viajes}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="No se encontraron viajes registrados."
          globalFilter={globalFilter}
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID Viaje" body={idViajeBodyTemplate} sortable />
          <Column field="placa_vehiculo" header="Vehículo" sortable />
          <Column field="nombre_piloto" header="Piloto" sortable />
          <Column
            field="nombre_tienda"
            header="Destino / País"
            body={(r) => (
              <div className="flex flex-column">
                <span className="font-semibold text-sm">{r.nombre_tienda || 'Tienda Destino'}</span>
                <span className="text-xs text-500">{r.pais_destino || 'Centroamérica'}</span>
              </div>
            )}
            sortable
          />
          <Column field="estado" header="Estado" body={estadoTemplate} sortable />
          <Column field="fecha_plan_salida" header="Salida" body={dateTemplate} sortable />
          <Column field="fecha_esperada_llegada" header="ETA" body={(r) => dateTemplate({ fecha_plan_salida: r.fecha_esperada_llegada })} sortable />
          <Column field="total_gasto" header="Costo Operativo" body={costoBodyTemplate} sortable />
          <Column body={actionTemplate} header="Acciones" exportable={false} style={{ minWidth: '13rem' }} />
        </DataTable>
      </div>

      {/* =========================================================================
          MODAL: REGISTRO Y TOTALIZACIÓN DE COSTOS DE VIAJE
         ========================================================================= */}
      <Dialog
        visible={gastosDialogVisible}
        style={{ width: '700px', maxWidth: '95vw' }}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-dollar text-primary text-xl"></i>
            <span>Costos Logísticos y Sobrecostos de Viaje</span>
          </div>
        }
        modal
        className="p-fluid"
        footer={(
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" text onClick={() => setGastosDialogVisible(false)} />
            <Button label="Guardar Liquidación" icon="pi pi-check" loading={savingGastos} onClick={handleSaveGastos} />
          </div>
        )}
        onHide={() => setGastosDialogVisible(false)}
      >
        {selectedViajeForGastos && (
          <div>
            <div className="p-3 mb-3 border-round surface-ground flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <span className="text-xs text-500 block uppercase font-bold">Viaje Seleccionado</span>
                <span className="font-bold text-900">{selectedViajeForGastos.nombre_tienda || 'Destino'} ({selectedViajeForGastos.pais_destino || 'Internacional'})</span>
                <span className="text-xs text-600 block">Vehículo: {selectedViajeForGastos.placa_vehiculo} | Piloto: {selectedViajeForGastos.nombre_piloto}</span>
              </div>
              <Tag severity={estadoSeverity[selectedViajeForGastos.estado] || 'info'} value={selectedViajeForGastos.estado} />
            </div>

            <div className="grid formgrid">
              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="flete_base" className="font-bold mb-1 block">Flete Base Presupuestado ($ USD) *</label>
                <InputNumber
                  id="flete_base"
                  value={gastosForm.flete_base}
                  onValueChange={(e) => setGastosForm({ ...gastosForm, flete_base: e.value || 0 })}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
                <small className="text-500">Combustible de ruta, peajes previstos y amortización vehicular.</small>
              </div>

              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="multas_aduana" className="font-bold mb-1 block text-red-600">
                  <i className="pi pi-exclamation-triangle mr-1"></i>
                  Multas por Papeleo / DUCA ($ USD)
                </label>
                <InputNumber
                  id="multas_aduana"
                  value={gastosForm.multas_aduana}
                  onValueChange={(e) => setGastosForm({ ...gastosForm, multas_aduana: e.value || 0 })}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
                <small className="text-500">Infracciones por rectificación de pesaje o errores de factura.</small>
              </div>

              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="viaticos_extra" className="font-bold mb-1 block text-orange-600">
                  <i className="pi pi-clock mr-1"></i>
                  Viáticos Extra por Demora ($ USD)
                </label>
                <InputNumber
                  id="viaticos_extra"
                  value={gastosForm.viaticos_extra}
                  onValueChange={(e) => setGastosForm({ ...gastosForm, viaticos_extra: e.value || 0 })}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
                <small className="text-500">Alimentación y pernocta imprevista del conductor por colas fronterizas.</small>
              </div>

              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="parqueo_almacenaje" className="font-bold mb-1 block text-blue-600">
                  <i className="pi pi-building mr-1"></i>
                  Parqueo / Almacenaje en Frontera ($ USD)
                </label>
                <InputNumber
                  id="parqueo_almacenaje"
                  value={gastosForm.parqueo_almacenaje}
                  onValueChange={(e) => setGastosForm({ ...gastosForm, parqueo_almacenaje: e.value || 0 })}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
                <small className="text-500">Estadía en recintos fiscales durante aforo y semáforo aduanero.</small>
              </div>

              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="otros_imprevistos" className="font-bold mb-1 block">Otros Sobrecostos Imprevistos ($ USD)</label>
                <InputNumber
                  id="otros_imprevistos"
                  value={gastosForm.otros_imprevistos}
                  onValueChange={(e) => setGastosForm({ ...gastosForm, otros_imprevistos: e.value || 0 })}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
                <small className="text-500">Custodia en ruta, asistencia mecánica menor o pesajes extraordinarios.</small>
              </div>

              <div className="col-12 md:col-6 field mb-3">
                <label htmlFor="notas_gastos" className="font-bold mb-1 block">Justificación / Causa de Sobrecostos</label>
                <InputTextarea
                  id="notas_gastos"
                  value={gastosForm.notas}
                  onChange={(e) => setGastosForm({ ...gastosForm, notas: e.target.value })}
                  placeholder="Ej: Cola de 7 hrs en Pedro de Alvarado generó pernocta extra y rectificación de permiso fitosanitario..."
                  rows={3}
                />
              </div>
            </div>

            {/* Resumen Totalizador en Tiempo Real */}
            <div className="p-3 border-round border-1 border-blue-200 bg-blue-50 mt-3 flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <span className="text-xs text-blue-800 font-bold uppercase block">Total Sobrecostos Imprevistos</span>
                <span className="text-xl font-bold text-red-600">${liveSobrecostos.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                {liveRatioPct > 0 && (
                  <span className="text-xs text-red-500 block font-semibold">({liveRatioPct}% de incremento sobre flete base)</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-800 font-bold uppercase block">Costo Operativo Total Liquidado</span>
                <span className="text-3xl font-extrabold text-blue-900">${liveTotalGasto.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* =========================================================================
          MODAL: CREAR / EDITAR VIAJE
         ========================================================================= */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '800px', maxWidth: '95vw' }}
        header={isEdit ? 'Editar Viaje' : 'Nuevo Viaje'}
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveViaje} />
          </>
        )}
        onHide={hideDialog}
      >
        <div className="grid formgrid pt-2">
          <div className="col-12 md:col-6 field flex flex-column">
            <label htmlFor="fecha_plan_salida" className="font-bold mb-2">Fecha y Hora de Salida *</label>
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

          <div className="col-12 md:col-6 field flex flex-column">
            <label htmlFor="fecha_esperada_llegada" className="font-bold mb-2">Tiempo Estimado de Llegada (ETA)</label>
            <input
              type="datetime-local"
              id="fecha_esperada_llegada"
              className="p-inputtext p-component"
              value={formData.fecha_esperada_llegada ? new Date(formData.fecha_esperada_llegada.getTime() - formData.fecha_esperada_llegada.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, fecha_esperada_llegada: val ? new Date(val) : null });
              }}
            />
            <small className="text-500 mt-1">Opcional. Si se deja vacío, el sistema estimará con el promedio histórico.</small>
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="cargamento_id" className="font-bold mb-2 block">Cargamento *</label>
            <Dropdown id="cargamento_id" value={formData.cargamento_id} onChange={(e) => setFormData({ ...formData, cargamento_id: e.value })} options={cargamentos} optionLabel="id" optionValue="id" placeholder="Seleccione un cargamento" filter />
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="vehiculo_id" className="font-bold mb-2 block">Vehículo *</label>
            <Dropdown id="vehiculo_id" value={formData.vehiculo_id} onChange={(e) => setFormData({ ...formData, vehiculo_id: e.value })} options={vehiculos} optionLabel="placas" optionValue="id" placeholder="Seleccione un vehículo" filter />
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="usuario_id" className="font-bold mb-2 block">Piloto *</label>
            <Dropdown id="usuario_id" value={formData.usuario_id} onChange={(e) => setFormData({ ...formData, usuario_id: e.value })} options={pilotos} optionLabel="full_name" optionValue="id" placeholder="Seleccione un piloto" filter />
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="tienda_id" className="font-bold mb-2 block">Tienda Destino *</label>
            <Dropdown id="tienda_id" value={formData.tienda_id} onChange={(e) => setFormData({ ...formData, tienda_id: e.value })} options={tiendas} optionLabel="nombre" optionValue="id" placeholder="Seleccione una tienda" filter />
          </div>

          <div className="col-12 md:col-6 field">
            <label htmlFor="observaciones" className="font-bold mb-2 block">Observaciones</label>
            <InputTextarea id="observaciones" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} rows={2} autoResize={false} />
          </div>
        </div>
      </Dialog>

      {/* Dialog para mostrar detalles del viaje recién creado */}
      <Dialog
        visible={viewDialogVisible}
        style={{ width: '650px' }}
        header="Detalles del Viaje Creado"
        modal
        footer={(<Button label="Aceptar" icon="pi pi-check" onClick={() => setViewDialogVisible(false)} />)}
        onHide={() => setViewDialogVisible(false)}
      >
        {viewViaje && (
          <div className="p-fluid" style={{ fontSize: '1.1rem' }}>
            <div className="field mb-2"><label className="font-bold">ID Viaje: </label><span>{viewViaje.id}</span></div>
            <div className="field mb-2"><label className="font-bold">ID Cargamento: </label><span>{viewViaje.cargamento_id}</span></div>
            <div className="field mb-2"><label className="font-bold">Vehículo: </label><span>{viewViaje.placa_vehiculo || viewViaje.vehiculo_id}</span></div>
            <div className="field mb-2"><label className="font-bold">Piloto: </label><span>{viewViaje.nombre_piloto || viewViaje.usuario_id}</span></div>
            <div className="field mb-2"><label className="font-bold">Tienda Destino: </label><span>{viewViaje.nombre_tienda || viewViaje.tienda_id}</span></div>
            <div className="field mb-2"><label className="font-bold">Fecha Salida: </label><span>{viewViaje.fecha_plan_salida ? new Date(viewViaje.fecha_plan_salida).toLocaleString('es-GT') : ''}</span></div>
            <div className="field mb-2"><label className="font-bold">Estado: </label><span>{viewViaje.estado || 'planificado'}</span></div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog />
    </div>
  );
}
