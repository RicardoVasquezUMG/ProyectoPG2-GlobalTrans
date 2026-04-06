/**
 * API de autenticación.
 * Funciones para login, registro, logout y obtener usuario actual.
 */
import axiosInstance from './axiosInstance';

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
 */
export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Registra un nuevo usuario.
 * @param {{email: string, password: string, full_name: string, phone: string}} data
 * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
 */
export const registerUser = async (data) => {
  const response = await axiosInstance.post('/api/auth/register', data);
  return response.data;
};

