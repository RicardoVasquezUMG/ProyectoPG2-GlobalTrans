/**
 * Página de inicio de sesión.
 * Formulario con email y contraseña usando componentes nativos de PrimeReact y utilidades de PrimeFlex.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  /** Valida los campos del formulario */
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Maneja el envío del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const user = await login(email, password);
      showSuccess(`Bienvenido, ${user.full_name}`);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      showError(message);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <div className="inline-flex align-items-center justify-content-center bg-blue-500 text-white border-round-xl w-3rem h-3rem mb-3 shadow-2">
          <i className="pi pi-globe text-xl" />
        </div>
        <h2 className="text-900 text-2xl font-semibold mb-2">Iniciar sesión</h2>
        <span className="text-600 text-sm">Ingresa tus credenciales para acceder</span>
      </div>

      <form onSubmit={handleSubmit} className="p-fluid flex flex-column gap-3" noValidate>
        {/* Campo: Email */}
        <div className="flex flex-column gap-2">
          <label htmlFor="login-email" className="font-semibold text-700 text-sm">
            Correo electrónico
          </label>
          <IconField iconPosition="left" className="w-full">
            <InputIcon className="pi pi-envelope text-500" />
            <InputText
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="ejemplo@correo.com"
              className={errors.email ? 'p-invalid' : ''}
              autoComplete="email"
              autoFocus
            />
          </IconField>
          {errors.email && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.email}
            </small>
          )}
        </div>

        {/* Campo: Contraseña */}
        <div className="flex flex-column gap-2">
          <label htmlFor="login-password" className="font-semibold text-700 text-sm">
            Contraseña
          </label>
          <Password
            id="login-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="contraseña"
            className={errors.password ? 'p-invalid' : ''}
            feedback={false}
            toggleMask
            autoComplete="current-password"
          />
          {errors.password && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.password}
            </small>
          )}
        </div>

        <Button
          type="submit"
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          className="mt-3"
          loading={loading}
          disabled={loading}
        />
      </form>

      <div className="text-center mt-4 text-600 text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-blue-500 no-underline hover:underline">
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
