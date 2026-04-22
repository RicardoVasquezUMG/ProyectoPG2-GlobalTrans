import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getMenuItems } from '../utils/menuUtils';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Sesión cerrada correctamente');
      navigate('/login', { replace: true });
    } catch {
      showError('Error al cerrar sesión');
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Extraído */}
      <aside
        className={`dark-sidebar border-right-1 flex flex-column justify-content-between p-3 shadow-1 min-h-screen transition-all transition-duration-200 ${isSidebarCollapsed ? 'w-5rem' : 'w-18rem'
          }`}
      >
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center justify-content-between px-2 py-2 border-bottom-1 sidebar-border">
            {!isSidebarCollapsed && (
              <div className="flex align-items-center gap-2">
                <span className="font-bold text-lg font-display sidebar-text">GlobalTrans Inc</span>
              </div>
            )}
            <Button
              icon={isSidebarCollapsed ? "pi pi-chevron-right" : "pi pi-chevron-left"}
              className="p-button-text p-button-rounded p-button-plain p-0 w-2rem h-2rem ml-2"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          <div className="flex flex-column gap-1">
            {getMenuItems(user?.role).map((item) => {
              if (item.isDivider) {
                return !isSidebarCollapsed ? (
                  <span key={item.key} className="text-xs font-semibold uppercase tracking-wider px-2 py-2 mt-2 sidebar-text-muted">
                    {item.label}
                  </span>
                ) : (
                  <div key={item.key} className="border-bottom-1 sidebar-border my-2 w-full"></div>
                );
              }
              return (
                <Button
                  key={item.key}
                  label={!isSidebarCollapsed ? item.label : undefined}
                  icon={item.icon}
                  tooltip={isSidebarCollapsed ? item.label : undefined}
                  tooltipOptions={{ position: 'right' }}
                  onClick={() => navigate(item.path)}
                  className={`p-button-text justify-content-start w-full text-sm font-medium dark-sidebar-btn ${location.pathname.startsWith(item.path) ? 'active' : ''
                    } ${isSidebarCollapsed ? 'justify-content-center px-0' : ''}`}
                />
              );
            })}
          </div>
        </div>

        <div className="border-top-1 sidebar-border pt-3 flex flex-column gap-2">
          <div className={`flex align-items-center gap-2 p-2 border-round dark-sidebar-user ${isSidebarCollapsed ? 'justify-content-center px-0' : ''}`}>
            <Avatar
              image={user?.avatar_url || undefined}
              label={!user?.avatar_url ? getInitials(user?.full_name) : undefined}
              shape="circle"
              className="text-white flex-shrink-0"
              style={{ backgroundColor: '#64748b', color: '#ffffff' }}
            />
            {!isSidebarCollapsed && (
              <div className="flex flex-column overflow-hidden">
                <span className="font-semibold text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis sidebar-text">
                  {user?.full_name || 'Usuario'}
                </span>
                <span className="text-xs white-space-nowrap overflow-hidden text-overflow-ellipsis sidebar-text-muted">
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
            className={`p-button-outlined p-button-secondary w-full justify-content-center mt-1 ${isSidebarCollapsed ? 'px-0' : ''
              }`}
          />
        </div>
      </aside>

      {/* Aquí React Router inyectará las páginas dinámicamente */}
      <main className="flex-1 p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
