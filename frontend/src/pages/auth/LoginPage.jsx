/**
 * Página de inicio de sesión.
 * Formulario con email y contraseña usando componentes PrimeReact.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import './LoginPage.css';

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
    <div className="login-page">
      <div className="login-page__header">
        <h2 className="login-page__title">Iniciar sesión</h2>
        <p className="login-page__description">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="login-page__form" noValidate>
        {/* Campo: Email */}
        <div className="login-page__field">
          <label htmlFor="login-email" className="login-page__label">
            Correo electrónico
          </label>
          <div className="login-page__input-wrapper">
            <i className="pi pi-envelope login-page__input-icon" />
            <InputText
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="tu@correo.com"
              className={`login-page__input ${errors.email ? 'p-invalid' : ''}`}
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <small className="login-page__error">{errors.email}</small>
          )}
        </div>

        {/* Campo: Contraseña */}
        <div className="login-page__field">
          <label htmlFor="login-password" className="login-page__label">
            Contraseña
          </label>
          <Password
            id="login-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Tu contraseña"
            className={`login-page__password ${errors.password ? 'p-invalid' : ''}`}
            feedback={false}
            toggleMask
            autoComplete="current-password"
            inputClassName="login-page__input"
          />
          {errors.password && (
            <small className="login-page__error">{errors.password}</small>
          )}
        </div>

        {/* Botón de submit */}
        <Button
          type="submit"
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          className="login-page__submit"
          loading={loading}
          disabled={loading}
        />
      </form>

      {/* Link a registro */}
      <div className="login-page__footer">
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="login-page__link">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
