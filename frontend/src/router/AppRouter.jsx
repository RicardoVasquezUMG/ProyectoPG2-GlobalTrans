/**
 * Configuración de rutas de la aplicación.
 * Define las rutas públicas, privadas y los guards.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/shared/DashboardPage';
import NotFoundPage from '../pages/shared/NotFoundPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';
import PrivateRoute from '../guards/PrivateRoute';
import RoleRoute from '../guards/RoleRoute';
import { ROLES, PERMISSIONS } from '../utils/constants';

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas de autenticación (Públicas) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Rutas protegidas (Privadas) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Ejemplo de rutas protegidas por rol (Admin - LEVEL_1) */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={PERMISSIONS.MODULE_ADMIN}>
            <div style={{ padding: '2rem' }}>
              <h1>Panel de Administración</h1>
              <p>Solo accesible por LEVEL_1.</p>
            </div>
          </RoleRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Páginas de error */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
