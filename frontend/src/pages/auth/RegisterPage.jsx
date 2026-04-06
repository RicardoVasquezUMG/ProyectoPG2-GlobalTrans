/**
 * Página de registro de usuario.
 * Formulario que permite crear una cuenta con rol LEVEL_3 (Cliente) usando componentes nativos de PrimeReact.
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  /** Actualiza valores del formulario */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /** Valida los campos del formulario */
  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe contener entre 8 y 15 dígitos numéricos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Envía los datos de registro */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await register(formData);

      if (response.access_token) {
        showSuccess('Registro completado y sesión iniciada');
        navigate('/dashboard', { replace: true });
      } else {
        showSuccess('Registro exitoso. Se ha enviado un correo de confirmación.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al completar el registro. Intenta de nuevo.';
      showError(message);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <div className="inline-flex align-items-center justify-content-center bg-blue-500 text-white border-round-xl w-3rem h-3rem mb-2 shadow-2">
          <i className="pi pi-user-plus text-xl" />
        </div>
        <h2 className="text-900 text-2xl font-semibold mb-2">Crear cuenta</h2>
        <span className="text-600 text-sm">Completa los datos para registrarte</span>
      </div>

      <form onSubmit={handleSubmit} className="p-fluid flex flex-column gap-3" noValidate>
        {/* Campo: Nombre completo */}
        <div className="flex flex-column gap-2">
          <label htmlFor="register-name" className="font-semibold text-700 text-sm">
            Nombre completo
          </label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-user text-500" />
            <InputText
              id="register-name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Juan Pérez"
              className={errors.full_name ? 'p-invalid' : ''}
              autoComplete="name"
              autoFocus
            />
          </IconField>
          {errors.full_name && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.full_name}
            </small>
          )}
        </div>

        {/* Campo: Email */}
        <div className="flex flex-column gap-2">
          <label htmlFor="register-email" className="font-semibold text-700 text-sm">
            Correo electrónico
          </label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-envelope text-500" />
            <InputText
              id="register-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@correo.com"
              className={errors.email ? 'p-invalid' : ''}
              autoComplete="email"
            />
          </IconField>
          {errors.email && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.email}
            </small>
          )}
        </div>

        {/* Campo: Teléfono */}
        <div className="flex flex-column gap-2">
          <label htmlFor="register-phone" className="font-semibold text-700 text-sm">
            Teléfono
          </label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-phone text-500" />
            <InputText
              id="register-phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="12345678"
              className={errors.phone ? 'p-invalid' : ''}
              autoComplete="tel"
            />
          </IconField>
          {errors.phone && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.phone}
            </small>
          )}
        </div>

        {/* Campo: Contraseña */}
        <div className="flex flex-column gap-2">
          <label htmlFor="register-password" className="font-semibold text-700 text-sm">
            Contraseña
          </label>
          <Password
            id="register-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={errors.password ? 'p-invalid' : ''}
            toggleMask
            autoComplete="new-password"
            promptLabel="Escribe una contraseña"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
          />
          {errors.password && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.password}
            </small>
          )}
        </div>

        {/* Campo: Confirmar contraseña */}
        <div className="flex flex-column gap-2">
          <label htmlFor="register-confirm" className="font-semibold text-700 text-sm">
            Confirmar contraseña
          </label>
          <Password
            id="register-confirm"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Repite tu contraseña"
            className={errors.confirmPassword ? 'p-invalid' : ''}
            feedback={false}
            toggleMask
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <small className="p-error flex align-items-center gap-1 text-xs">
              <i className="pi pi-exclamation-circle" /> {errors.confirmPassword}
            </small>
          )}
        </div>

        <Button
          type="submit"
          label="Crear cuenta"
          icon="pi pi-user-plus"
          className="mt-2"
          loading={loading}
          disabled={loading}
        />
      </form>

      <div className="text-center mt-4 text-600 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-blue-500 no-underline hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
