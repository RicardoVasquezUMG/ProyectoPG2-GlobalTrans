/**
 * Layout para páginas de autenticación (login, registro).
 * Split layout: panel decorativo izquierdo + formulario derecho.
 */
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Panel decorativo izquierdo */}
      <div className="auth-layout__brand">
        <div className="auth-layout__brand-content">
          {/* Elemento decorativo animado */}
          <div className="auth-layout__orb auth-layout__orb--1" />
          <div className="auth-layout__orb auth-layout__orb--2" />
          <div className="auth-layout__orb auth-layout__orb--3" />

          <div className="auth-layout__brand-text">
            <div className="auth-layout__logo">
              <i className="pi pi-globe" />
            </div>
            <h1 className="auth-layout__title">GlobalTrans</h1>
            <p className="auth-layout__subtitle">
              Gestión de Transporte Centroamericano.
            </p>
            <div className="auth-layout__features">
              <div className="auth-layout__feature">
                <i className="pi pi-map-marker" />
                <span>Rastreo en tiempo real</span>
              </div>
              <div className="auth-layout__feature">
                <i className="pi pi-chart-line" />
                <span>Análisis de rutas</span>
              </div>
              <div className="auth-layout__feature">
                <i className="pi pi-shield" />
                <span>Seguridad garantizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel del formulario */}
      <div className="auth-layout__form-panel">
        <div className="auth-layout__form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
