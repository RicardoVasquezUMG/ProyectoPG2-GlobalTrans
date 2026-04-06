/**
 * Instancia centralizada de Axios.
 * Incluye interceptors para agregar token JWT y manejar errores globalmente.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Referencia al token para los interceptors (se actualiza desde AuthContext)
let authToken = null;

/**
 * Actualiza el token usado en las peticiones.
 * @param {string|null} token - Token JWT o null para limpiar
 */
export const setAuthToken = (token) => {
  authToken = token;
};

// Interceptor de request: agrega el token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: manejo global de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token expirado o inválido — limpiar sesión
        setAuthToken(null);
        // Redirigir al login si no estamos ya ahí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
