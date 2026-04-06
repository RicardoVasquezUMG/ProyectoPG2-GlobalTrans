/**
 * Dashboard principal con navegación mediante Sidebar estilo PrimeReact.
 * Incluye módulo único de Perfil con tabla de detalles y modal de edición.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getMenuItems } from '../../utils/menuUtils';

export default function DashboardPage() {
  const { user, logout, checkSession, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Estado del menú activo
  const [activeItem, setActiveItem] = useState(null);
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estado del Modal de Edición
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });


  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Sesión cerrada correctamente');
      navigate('/login', { replace: true });
    } catch {
      showError('Error al cerrar sesión');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      showError('El nombre completo es requerido');
      return;
    }
    updateUser(formData);
    showSuccess('Perfil actualizado correctamente');
    setEditDialogVisible(false);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'LEVEL_1':
        return 'Administrador';
      case 'LEVEL_2':
        return 'Analista';
      case 'LEVEL_3':
        return 'Piloto';
      default:
        return 'Usuario';
    }
  };

  const getRoleSeverity = (role) => {
    switch (role) {
      case 'LEVEL_1':
        return 'danger';
      case 'LEVEL_2':
        return 'warning';
      case 'LEVEL_3':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Avatar Iniciales
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Lateral (Estructura PrimeReact / Layout) */}
      <aside
        className={`bg-white border-right-1 border-300 flex flex-column justify-content-between p-3 shadow-1 min-h-screen transition-all transition-duration-200 ${
          isSidebarCollapsed ? 'w-5rem' : 'w-18rem'
        }`}
      >
        <div className="flex flex-column gap-3">
          {/* Header de Sidebar */}
          <div className="flex align-items-center justify-content-between px-2 py-2 border-bottom-1 border-200">
            {!isSidebarCollapsed && (
              <div className="flex align-items-center gap-2">
                <div className="flex align-items-center justify-content-center w-2rem h-2rem border-round bg-blue-600 text-white font-bold text-xs">
                  GT
                </div>
                <span className="font-bold text-lg text-900 font-display">GlobalTrans Inc</span>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="flex align-items-center justify-content-center w-2rem h-2rem border-round bg-blue-600 text-white font-bold text-xs mx-auto">
                GT
              </div>
            )}
            <Button
              icon={isSidebarCollapsed ? "pi pi-chevron-right" : "pi pi-chevron-left"}
              className="p-button-text p-button-rounded p-button-plain p-0 w-2rem h-2rem ml-2"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Menú de Navegación dinámico según rol */}
          <div className="flex flex-column gap-1">
            {!isSidebarCollapsed && (
              <span className="text-xs font-semibold text-400 uppercase tracking-wider px-2 py-1">
                Navegación
              </span>
            )}
            {getMenuItems(user?.role).map((item) => (
              <Button
                key={item.key}
                label={!isSidebarCollapsed ? item.label : undefined}
                icon={item.icon}
                tooltip={isSidebarCollapsed ? item.label : undefined}
                tooltipOptions={{ position: 'right' }}
                onClick={() => setActiveItem(item.key)}
                className={`p-button-text justify-content-start w-full text-sm font-medium ${
                  activeItem === item.key ? 'bg-blue-50 text-blue-700' : 'text-700 p-button-plain'
                } ${isSidebarCollapsed ? 'justify-content-center px-0' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Footer de Sidebar */}
        <div className="border-top-1 border-200 pt-3 flex flex-column gap-2">
          <div className={`flex align-items-center gap-2 p-2 border-round hover:bg-100 ${isSidebarCollapsed ? 'justify-content-center px-0' : ''}`}>
            <Avatar
              image={user?.avatar_url || undefined}
              label={!user?.avatar_url ? getInitials(user?.full_name) : undefined}
              shape="circle"
              className="bg-blue-100 text-blue-700 flex-shrink-0"
            />
            {!isSidebarCollapsed && (
              <div className="flex flex-column overflow-hidden">
                <span className="font-semibold text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                  {user?.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-500 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                  {user?.email}
                </span>
              </div>
            )}
          </div>

          <Button
            label={!isSidebarCollapsed ? 'Cerrar sesión' : undefined}
            icon="pi pi-sign-out"
            tooltip={isSidebarCollapsed ? 'Cerrar sesión' : undefined}
            tooltipOptions={{ position: 'right' }}
            onClick={handleLogout}
            className={`p-button-outlined p-button-danger w-full justify-content-center mt-1 ${
              isSidebarCollapsed ? 'px-0' : ''
            }`}
          />
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 p-5 overflow-y-auto">
  {!activeItem && (
    <h2 className="text-2xl font-bold text-900 m-0">Bienvenido, {user?.full_name || 'Usuario'}</h2>
  )}
        {activeItem === 'perfil' && (
          <div className="w-full mx-auto flex flex-column gap-4" style={{ maxWidth: '800px' }}>
            <div className="flex align-items-center justify-content-between">
              <div>
                <h1 className="text-3xl font-bold text-900 m-0">Perfil de Usuario</h1>
                <p className="text-600 m-0 mt-1">Información general y detalles de la cuenta</p>
              </div>
              <Button
                label="Editar Perfil"
                icon="pi pi-user-edit"
                onClick={() => setEditDialogVisible(true)}
                className="p-button-primary"
              />
            </div>

            <Card className="shadow-2 border-1 border-200">
              <div className="flex align-items-center gap-4 mb-4 pb-4 border-bottom-1 border-200">
                <Avatar
                  image={user?.avatar_url || undefined}
                  label={!user?.avatar_url ? getInitials(user?.full_name) : undefined}
                  size="xlarge"
                  shape="circle"
                  className="bg-blue-500 text-white shadow-2"
                  style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-900 m-0">{user?.full_name}</h2>
                  <span className="text-600 text-sm">{user?.email}</span>
                  <div className="mt-2">
                    <Tag value={getRoleLabel(user?.role)} severity={getRoleSeverity(user?.role)} />
                  </div>
                </div>
              </div>

              {/* Tabla / Lista de Información */}
              <div className="grid">
                <div className="col-12 md:col-6 p-3 border-bottom-1 border-200">
                  <span className="text-xs font-semibold text-500 uppercase tracking-wider block mb-1">Nombre Completo</span>
                  <span className="text-900 font-medium text-lg">{user?.full_name || 'N/A'}</span>
                </div>
                <div className="col-12 md:col-6 p-3 border-bottom-1 border-200">
                  <span className="text-xs font-semibold text-500 uppercase tracking-wider block mb-1">Correo Electrónico</span>
                  <span className="text-900 font-medium text-lg">{user?.email || 'N/A'}</span>
                </div>
                <div className="col-12 md:col-6 p-3 border-bottom-1 border-200">
                  <span className="text-xs font-semibold text-500 uppercase tracking-wider block mb-1">Teléfono</span>
                  <span className="text-900 font-medium text-lg">{user?.phone || 'No registrado'}</span>
                </div>
                <div className="col-12 md:col-6 p-3 border-bottom-1 border-200">
                  <span className="text-xs font-semibold text-500 uppercase tracking-wider block mb-1">Rol / Permiso</span>
                  <span className="text-900 font-medium text-lg">{getRoleLabel(user?.role)}</span>
                </div>
                <div className="col-12 p-3">
                  <span className="text-xs font-semibold text-500 uppercase tracking-wider block mb-1">URL de Avatar</span>
                  <span className="text-800 text-sm word-break-break-all">{user?.avatar_url || 'Sin imagen'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modal / Dialog para editar Nombre, Teléfono y Avatar */}
      <Dialog
        header="Editar Perfil"
        visible={editDialogVisible}
        style={{ width: '450px' }}
        onHide={() => setEditDialogVisible(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text p-button-secondary" />
            <Button label="Guardar" icon="pi pi-check" onClick={handleSaveProfile} className="p-button-primary" />
          </div>
        }
      >
        <form onSubmit={handleSaveProfile} className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-1">
            <label htmlFor="full_name" className="font-semibold text-sm">
              Nombre Completo
            </label>
            <InputText
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="phone" className="font-semibold text-sm">
              Teléfono
            </label>
            <InputText
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej. +502 5555 5555"
            />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="avatar_url" className="font-semibold text-sm">
              URL del Avatar
            </label>
            <InputText
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
