/**
 * Página de error 403 (Acceso no autorizado).
 */
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--gt-deep-navy)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <i
        className="pi pi-lock"
        style={{
          fontSize: '5rem',
          color: 'var(--gt-error)',
          marginBottom: '1.5rem',
        }}
      />
      <h1 style={{ fontSize: 'var(--gt-text-4xl)', marginBottom: '1rem' }}>Acceso No Autorizado</h1>
      <p style={{ color: 'var(--gt-text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        No tienes los permisos necesarios para ver esta sección. Si crees que esto es un error, contacta al administrador.
      </p>
      <Button
        label="Volver"
        icon="pi pi-arrow-left"
        onClick={() => navigate(-1)}
      />
    </div>
  );
}
