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

import UsersPage from '../pages/admin/UsersPage';
import VehiclesPage from '../pages/admin/VehiclesPage';
import FurgonesPage from '../pages/admin/FurgonesPage';
import CampaniasPage from '../pages/admin/CampaniasPage';
import AduanasPage from '../pages/admin/AduanasPage';
import TiendasPage from '../pages/admin/TiendasPage';
import CargamentosPage from '../pages/admin/CargamentosPage';
import ViajesPage from '../pages/admin/ViajesPage';
import MonitoreoPage from '../pages/admin/MonitoreoPage';
import ViajeDetallePage from '../pages/admin/ViajeDetallePage';
import ScheduleCrudPage from '../pages/operator/ScheduleCrudPage';
import MisViajesPage from '../pages/operator/MisViajesPage';
import NavegacionViajePage from '../pages/operator/NavegacionViajePage';
import DocumentsCrudPage from '../pages/client/DocumentsCrudPage';


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
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/vehiculos"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <VehiclesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/furgones"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <FurgonesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/campanias"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <CampaniasPage />
            </RoleRoute>
          }
        />
        <Route
          path="/tiendas"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <TiendasPage />
            </RoleRoute>
          }
        />
        <Route
          path="/cargamentos"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <CargamentosPage />
            </RoleRoute>
          }
        />
        <Route
          path="/aduanas"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <AduanasPage />
            </RoleRoute>
          }
        />

        {/* Rutas protegidas por rol: Nivel 2 (Analista) */}
        <Route
          path="/cronogramas"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_2']}>
              <ScheduleCrudPage />
            </RoleRoute>
          }
        />

        {/* Rutas protegidas por rol: Nivel 3 (Piloto) */}
        <Route
          path="/mis-viajes"
          element={
            <RoleRoute allowedRoles={['LEVEL_3']}>
              <MisViajesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/pilot/navegacion/:id"
          element={
            <RoleRoute allowedRoles={['LEVEL_3']}>
              <NavegacionViajePage />
            </RoleRoute>
          }
        />
        <Route
          path="/viajes"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <ViajesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/viajes/:id"
          element={
            <RoleRoute allowedRoles={['LEVEL_1', 'LEVEL_2', 'LEVEL_3']}>
              <ViajeDetallePage />
            </RoleRoute>
          }
        />
        <Route
          path="/monitoreo"
          element={
            <RoleRoute allowedRoles={['LEVEL_1']}>
              <MonitoreoPage />
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
