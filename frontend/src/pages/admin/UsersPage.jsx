import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getUsers, deleteUser, updateUserProfile } from '../../api/usersApi';
import { getRoles } from '../../api/rolesApi';
import { useToast } from '../../hooks/useToast';
import { FilterMatchMode } from 'primereact/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      // Filtrar usuarios inactivos si deseamos, o mostrarlos con un tag
      // En este caso mostraremos todos pero indicaremos su estado.
      setUsers(usersData);
      setRoles(rolesData.map(r => ({ label: r.description || r.name, value: r.id })));
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
        <h2 className="m-0 text-xl font-bold">Usuarios del Sistema</h2>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="   Buscar..." />
        </span>
      </div>
    );
  };

  const openEditDialog = (user) => {
    setEditingUser({ ...user });
    setEditDialogVisible(true);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
    setEditingUser(null);
  };

  const saveUser = async () => {
    if (!editingUser.role_id) {
      showError('Debe seleccionar un rol');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(editingUser.id, {
        role_id: editingUser.role_id,
        is_active: editingUser.is_active
      });
      showSuccess('Usuario actualizado correctamente');
      hideEditDialog();
      loadData();
    } catch (error) {
      showError('Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (user) => {
    confirmDialog({
      message: `¿Está seguro que desea desactivar al usuario ${user.full_name}?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Desactivar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await deleteUser(user.id);
          showSuccess('Usuario desactivado');
          loadData();
        } catch (error) {
          showError('Error al desactivar el usuario');
        }
      }
    });
  };

  // Templates para columnas
  const roleBodyTemplate = (rowData) => {
    return <span>{rowData.roles?.description || rowData.roles?.name || 'Desconocido'}</span>;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.is_active ? 'Activo' : 'Inactivo'}
        severity={rowData.is_active ? 'success' : 'danger'}
      />
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined className="p-button-sm" onClick={() => openEditDialog(rowData)} tooltip="Editar Rol/Estado" />
        {rowData.is_active && (
          <Button icon="pi pi-trash" rounded outlined severity="danger" className="p-button-sm" onClick={() => confirmDelete(rowData)} tooltip="Desactivar" />
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <ConfirmDialog />
      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={['full_name', 'email', 'phone', 'roles.description']}
        header={renderHeader()}
        emptyMessage="No se encontraron usuarios."
        stripedRows
      >
        <Column field="full_name" header="Nombre Completo" sortable />
        <Column field="email" header="Correo" sortable />
        <Column field="phone" header="Teléfono" sortable />
        <Column header="Rol" body={roleBodyTemplate} sortable sortField="roles.name" />
        <Column header="Estado" body={statusBodyTemplate} sortable sortField="is_active" />
        <Column header="Acciones" body={actionsBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
      </DataTable>

      <Dialog
        visible={editDialogVisible}
        style={{ width: '450px' }}
        header="Editar Usuario"
        modal
        className="p-fluid"
        footer={(
          <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} disabled={saving} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveUser} loading={saving} />
          </>
        )}
        onHide={hideEditDialog}
      >
        {editingUser && (
          <div className="flex flex-column gap-4 pt-2">
            <div className="field">
              <label className="font-bold">Nombre Completo</label>
              <InputText value={editingUser.full_name} disabled />
            </div>
            <div className="field">
              <label className="font-bold">Correo Electrónico</label>
              <InputText value={editingUser.email} disabled />
            </div>
            <div className="field">
              <label htmlFor="role" className="font-bold">Asignar Rol</label>
              <Dropdown
                id="role"
                value={editingUser.role_id}
                options={roles}
                onChange={(e) => setEditingUser({ ...editingUser, role_id: e.value })}
                placeholder="Seleccione un rol"
              />
            </div>
            <div className="field flex align-items-center gap-2">
              <label htmlFor="is_active" className="font-bold m-0">Estado de Cuenta:</label>
              <Dropdown
                id="is_active"
                value={editingUser.is_active}
                options={[{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }]}
                onChange={(e) => setEditingUser({ ...editingUser, is_active: e.value })}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
