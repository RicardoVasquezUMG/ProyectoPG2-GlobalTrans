/**
 * Contexto de autenticación.
 * Maneja el estado del usuario, tokens y funciones de login/registro/logout.
 * Los tokens se almacenan solo en memoria (state), nunca en localStorage.
 */
import { createContext, useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../api/authApi';
import { setAuthToken } from '../api/axiosInstance';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Sincronizar el token con el interceptor de Axios
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  /**
   * Inicia sesión con email y contraseña.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Datos del usuario
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra un nuevo usuario.
   * @param {{email: string, password: string, full_name: string, phone: string}} formData
   * @returns {Promise<object>} Datos del usuario creado
   */
  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const data = await registerUser(formData);
      // Si el registro retornó token (no requiere confirmación de email)
      if (data.access_token) {
        setToken(data.access_token);
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra la sesión del usuario.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignorar errores de logout — limpiar estado de todas formas
    } finally {
      setToken(null);
      setUser(null);
      setAuthToken(null);
    }
  }, []);

  /**
   * Verifica si hay una sesión activa.
   * Se usa internamente para intentar recuperar la sesión al montar.
   */
  const checkSession = useCallback(async () => {
    if (!token) return;
    setInitializing(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      // Token inválido o expirado
      setToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    initializing,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
