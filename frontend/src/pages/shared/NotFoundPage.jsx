/**
 * Página de error 404 (No Encontrado).
 */
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
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
        className="pi pi-compass"
        style={{
          fontSize: '5rem',
          color: 'var(--gt-electric-blue)',
          marginBottom: '1.5rem',
        }}
      />
      <h1 style={{ fontSize: 'var(--gt-text-4xl)', marginBottom: '1rem' }}>404 - Página no encontrada</h1>
      <p style={{ color: 'var(--gt-text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        Lo sentimos, la página que buscas no existe o ha sido movida temporalmente.
      </p>
      <Button
        label="Ir al Inicio"
        icon="pi pi-home"
        onClick={() => navigate('/')}
      />
    </div>
  );
}
