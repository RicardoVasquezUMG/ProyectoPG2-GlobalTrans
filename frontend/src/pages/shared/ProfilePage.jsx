import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { updateUserProfile } from '../../api/usersApi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      showError('El nombre completo es requerido');
      return;
    }
    
    if (!user?.id) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, formData);
      updateUser(formData);
      showSuccess('Perfil actualizado correctamente');
      setEditDialogVisible(false);
    } catch (error) {
      showError('Error al actualizar el perfil en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'LEVEL_1': return 'Administrador';
      case 'LEVEL_2': return 'Analista';
      case 'LEVEL_3': return 'Piloto';
      default: return 'Usuario';
    }
  };

  const getRoleSeverity = (role) => {
    switch (role) {
      case 'LEVEL_1': return 'danger';
      case 'LEVEL_2': return 'warning';
      case 'LEVEL_3': return 'info';
      default: return 'secondary';
    }
  };

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
    <>
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
              className="bg-blue-500 text-900 shadow-8"
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

      <Dialog
        header="Editar Perfil"
        visible={editDialogVisible}
        style={{ width: '450px' }}
        onHide={() => setEditDialogVisible(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text p-button-secondary" disabled={loading} />
            <Button label="Guardar" icon="pi pi-check" onClick={handleSaveProfile} className="p-button-primary" loading={loading} />
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
    </>
  );
}
