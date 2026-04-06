/**
 * Página de registro de usuario.
 * Formulario con nombre, email, teléfono, contraseña y confirmación.
 * Asigna automáticamente el rol LEVEL_3 (Cliente).
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { InputMask } from 'primereact/inputmask';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import './RegisterPage.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  /** Actualiza un campo del formulario */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /** Valida todos los campos del formulario */
  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (formData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'El teléfono debe tener al menos 8 dígitos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Maneja el envío del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
      });

      if (data.access_token) {
        showSuccess('Cuenta creada exitosamente. ¡Bienvenido!');
        navigate('/dashboard', { replace: true });
      } else {
        showInfo('Cuenta creada. Revisa tu correo para confirmar tu cuenta.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al crear la cuenta. Intenta de nuevo.';
      showError(message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__header">
        <h2 className="register-page__title">Crear cuenta</h2>
        <p className="register-page__description">
          Completa tus datos para registrarte en el sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="register-page__form" noValidate>
        {/* Campo: Nombre completo */}
        <div className="register-page__field">
          <label htmlFor="register-name" className="register-page__label">
            Nombre completo
          </label>
          <div className="register-page__input-wrapper">
            <i className="pi pi-user register-page__input-icon" />
            <InputText
              id="register-name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Juan Pérez"
              className={`register-page__input ${errors.full_name ? 'p-invalid' : ''}`}
              autoComplete="name"
              autoFocus
            />
          </div>
          {errors.full_name && (
            <small className="register-page__error">{errors.full_name}</small>
          )}
        </div>

        {/* Campo: Email */}
        <div className="register-page__field">
          <label htmlFor="register-email" className="register-page__label">
            Correo electrónico
          </label>
          <div className="register-page__input-wrapper">
            <i className="pi pi-envelope register-page__input-icon" />
            <InputText
              id="register-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@correo.com"
              className={`register-page__input ${errors.email ? 'p-invalid' : ''}`}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <small className="register-page__error">{errors.email}</small>
          )}
        </div>

        {/* Campo: Teléfono */}
        <div className="register-page__field">
          <label htmlFor="register-phone" className="register-page__label">
            Teléfono
          </label>
          <div className="register-page__input-wrapper">
            <i className="pi pi-phone register-page__input-icon" />
            <InputText
              id="register-phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="12345678"
              className={`register-page__input ${errors.phone ? 'p-invalid' : ''}`}
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <small className="register-page__error">{errors.phone}</small>
          )}
        </div>

        {/* Campo: Contraseña */}
        <div className="register-page__field">
          <label htmlFor="register-password" className="register-page__label">
            Contraseña
          </label>
          <Password
            id="register-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={`register-page__password ${errors.password ? 'p-invalid' : ''}`}
            toggleMask
            autoComplete="new-password"
            inputClassName="register-page__input"
            promptLabel="Escribe una contraseña"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
          />
          {errors.password && (
            <small className="register-page__error">{errors.password}</small>
          )}
        </div>

        {/* Campo: Confirmar contraseña */}
        <div className="register-page__field">
          <label htmlFor="register-confirm" className="register-page__label">
            Confirmar contraseña
          </label>
          <Password
            id="register-confirm"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Repite tu contraseña"
            className={`register-page__password ${errors.confirmPassword ? 'p-invalid' : ''}`}
            feedback={false}
            toggleMask
            autoComplete="new-password"
            inputClassName="register-page__input"
          />
          {errors.confirmPassword && (
            <small className="register-page__error">{errors.confirmPassword}</small>
          )}
        </div>

        {/* Botón de submit */}
        <Button
          type="submit"
          label="Crear cuenta"
          icon="pi pi-user-plus"
          className="register-page__submit"
          loading={loading}
          disabled={loading}
        />
      </form>

      {/* Link a login */}
      <div className="register-page__footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="register-page__link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
