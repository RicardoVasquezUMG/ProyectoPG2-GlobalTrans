/**
 * Guard de ruta privada.
 * Redirige a /login si el usuario no está autenticado.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex align-items-center justify-content-center bg-slate-50">
        <i className="pi pi-spin pi-spinner text-blue-600" style={{ fontSize: '2rem' }}></i>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
