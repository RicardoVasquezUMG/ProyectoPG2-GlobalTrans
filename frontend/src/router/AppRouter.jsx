/**
 * Configuración de rutas de la aplicación.
 * Define las rutas públicas, privadas y los guards.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/admin/DashboardPage'; // Our new unified dashboard
import ProfilePage from '../pages/shared/ProfilePage';
import NotFoundPage from '../pages/shared/NotFoundPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';
import PrivateRoute from '../guards/PrivateRoute';
import RoleRoute from '../guards/RoleRoute';
import { ROLES } from '../utils/constants';

// Level 1 & 2 Analytics
import MonitoringPage from '../pages/operator/MonitoringPage';
import ReportsAndAuditPage from '../pages/admin/ReportsAndAuditPage';

// Level 1
import UsersPage from '../pages/admin/UsersPage';
import VehiclesPage from '../pages/admin/VehiclesPage';
import FurgonesPage from '../pages/admin/FurgonesPage';
import CampaniasPage from '../pages/admin/CampaniasPage';
import TiendasPage from '../pages/admin/TiendasPage';
import CargamentosPage from '../pages/admin/CargamentosPage';
import ViajesPage from '../pages/admin/ViajesPage';
import AduanasPage from '../pages/admin/AduanasPage';
import ViajeDetallePage from '../pages/admin/ViajeDetallePage';

// Level 2 (Operador/Analista)
import ScheduleCrudPage from '../pages/operator/ScheduleCrudPage';

// Level 3 (Piloto)
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
        
        {/* Rutas de Monitoreo y Auditoría (Admin y Operador) */}
        <Route path="/monitoreo" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1, ROLES.LEVEL_2]}><MonitoringPage /></RoleRoute>} />
        <Route path="/auditoria" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1, ROLES.LEVEL_2]}><ReportsAndAuditPage /></RoleRoute>} />

        {/* Rutas protegidas por rol: Nivel 1 (Admin) */}
        <Route path="/usuarios" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><UsersPage /></RoleRoute>} />
        <Route path="/vehiculos" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><VehiclesPage /></RoleRoute>} />
        <Route path="/furgones" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><FurgonesPage /></RoleRoute>} />
        <Route path="/campanias" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><CampaniasPage /></RoleRoute>} />
        <Route path="/tiendas" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><TiendasPage /></RoleRoute>} />
        <Route path="/cargamentos" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><CargamentosPage /></RoleRoute>} />
        <Route path="/aduanas" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><AduanasPage /></RoleRoute>} />
        <Route path="/viajes" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1]}><ViajesPage /></RoleRoute>} />
        <Route path="/viajes/:id" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1, ROLES.LEVEL_2, ROLES.LEVEL_3]}><ViajeDetallePage /></RoleRoute>} />

        {/* Rutas protegidas por rol: Nivel 2 (Analista) */}
        <Route path="/cronogramas" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1, ROLES.LEVEL_2]}><ScheduleCrudPage /></RoleRoute>} />

        {/* Rutas protegidas por rol: Nivel 3 (Piloto) */}
        <Route path="/mis-viajes" element={<RoleRoute allowedRoles={[ROLES.LEVEL_3]}><MisViajesPage /></RoleRoute>} />
        <Route path="/pilot/navegacion/:id" element={<RoleRoute allowedRoles={[ROLES.LEVEL_3]}><NavegacionViajePage /></RoleRoute>} />
        <Route path="/documentos" element={<RoleRoute allowedRoles={[ROLES.LEVEL_1, ROLES.LEVEL_3]}><DocumentsCrudPage /></RoleRoute>} />
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
