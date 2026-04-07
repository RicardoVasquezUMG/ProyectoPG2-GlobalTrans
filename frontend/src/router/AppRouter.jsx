/**
 * Configuración de rutas de la aplicación.
 * Define las rutas públicas, privadas y los guards.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/shared/DashboardPage';
import ProfilePage from '../pages/shared/ProfilePage';
import NotFoundPage from '../pages/shared/NotFoundPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';
import PrivateRoute from '../guards/PrivateRoute';
import RoleRoute from '../guards/RoleRoute';
import { ROLES, PERMISSIONS } from '../utils/constants';

// Placeholders para nuevas vistas CRUD
import VehicleCrudPage from '../pages/operator/VehicleCrudPage';
import VanCrudPage from '../pages/operator/VanCrudPage';
import ScheduleCrudPage from '../pages/operator/ScheduleCrudPage';
import TripsCrudPage from '../pages/client/TripsCrudPage';
import DocumentsCrudPage from '../pages/client/DocumentsCrudPage';

// Componente placeholder para usuarios si no existe
const UsersPagePlaceholder = () => <div className="p-5"><h1>Gestión de Usuarios</h1></div>;

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas de autenticación (Públicas) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Rutas protegidas (Privadas) envueltas en MainLayout */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Rutas compartidas por todos los usuarios logueados */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Rutas protegidas por rol: Nivel 1 (Admin) */}
        <Route
          path="/usuarios"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.MODULE_ADMIN || ['LEVEL_1']}>
              <UsersPagePlaceholder />
            </RoleRoute>
          }
        />

        {/* Rutas protegidas por rol: Nivel 2 (Operador) */}
        <Route
          path="/vehiculos"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_2']}>
              <VehicleCrudPage />
            </RoleRoute>
          }
        />
        <Route
          path="/furgones"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_2']}>
              <VanCrudPage />
            </RoleRoute>
          }
        />
        <Route
          path="/cronogramas"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_2']}>
              <ScheduleCrudPage />
            </RoleRoute>
          }
        />

        {/* Rutas protegidas por rol: Nivel 3 (Cliente / Viajes) */}
        <Route
          path="/viajes"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_3']}>
              <TripsCrudPage />
            </RoleRoute>
          }
        />
        <Route
          path="/documentos"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_3']}>
              <DocumentsCrudPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Páginas de error */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
