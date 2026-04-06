/**
 * Guard de ruta privada.
 * Redirige a /login si el usuario no está autenticado.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  // Solo bloquear renderizado si está inicializando la sesión inicial y no está autenticado
  if (initializing && !isAuthenticated) {
    return null;
  }

  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
