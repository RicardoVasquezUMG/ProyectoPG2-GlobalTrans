/**
 * Página principal / Dashboard (Placeholder post-login).
 * Muestra información del perfil del usuario y botón de cerrar sesión.
 */
import { useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, logout, checkSession } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Asegura verificar los datos de la sesión actual al montar la página
  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Sesión cerrada correctamente');
      navigate('/login', { replace: true });
    } catch (error) {
      showError('Error al cerrar sesión');
    }
  };

  const cardHeader = (
    <div className="dashboard-page__card-header">
      <div className="dashboard-page__avatar-wrapper">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="Avatar" className="dashboard-page__avatar" />
        ) : (
          <div className="dashboard-page__avatar-placeholder">
            <i className="pi pi-user" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__topbar">
        <div className="dashboard-page__brand">
          <i className="pi pi-globe dashboard-page__brand-icon" />
          <span className="dashboard-page__brand-name">GlobalTrans</span>
        </div>
        <Button
          label="Cerrar sesión"
          icon="pi pi-sign-out"
          onClick={handleLogout}
          className="p-button-text p-button-secondary"
        />
      </header>

      <main className="dashboard-page__content">
        <Card header={cardHeader} className="dashboard-page__card">
          <div className="dashboard-page__user-info">
            <h1 className="dashboard-page__welcome">¡Hola, {user?.full_name}!</h1>
            <p className="dashboard-page__tagline">
              Has iniciado sesión exitosamente en el portal corporativo.
            </p>

            <div className="dashboard-page__details">
              <div className="dashboard-page__detail-item">
                <span className="dashboard-page__detail-label">Correo electrónico</span>
                <span className="dashboard-page__detail-value">{user?.email}</span>
              </div>

              <div className="dashboard-page__detail-item">
                <span className="dashboard-page__detail-label">Nivel de Acceso</span>
                <span className="dashboard-page__detail-value dashboard-page__role-tag">
                  {user?.role === 'LEVEL_1' && 'Nivel 1 (Administrador)'}
                  {user?.role === 'LEVEL_2' && 'Nivel 2 (Operador)'}
                  {user?.role === 'LEVEL_3' && 'Nivel 3 (Cliente)'}
                </span>
              </div>

              {user?.phone && (
                <div className="dashboard-page__detail-item">
                  <span className="dashboard-page__detail-label">Teléfono</span>
                  <span className="dashboard-page__detail-value">{user?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
