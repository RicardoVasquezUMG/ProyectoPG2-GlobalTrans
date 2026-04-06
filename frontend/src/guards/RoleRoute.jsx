/**
 * Guard de ruta por rol.
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex align-items-center justify-content-center bg-slate-50">
        <i className="pi pi-spin pi-spinner text-blue-600" style={{ fontSize: '2rem' }}></i>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
