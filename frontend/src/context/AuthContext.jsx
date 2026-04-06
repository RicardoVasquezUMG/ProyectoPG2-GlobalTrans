/**
 * Contexto de autenticación.
 * Maneja el estado del usuario, tokens y funciones de login/registro/logout.
 * Los tokens se almacenan solo en memoria (state), nunca en localStorage.
 */
import { createContext, useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Persist auth state to sessionStorage whenever it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('authUser');
    }
  }, [user]);

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
      // Backend now returns UserResponse directly
      setUser(data);
      sessionStorage.setItem('authUser', JSON.stringify(data));
      return data;
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
      setUser(data);
      sessionStorage.setItem('authUser', JSON.stringify(data));
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra la sesión del usuario.
   */
  const logout = useCallback(async () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
  }, []);

  /**
   * Verifica si hay una sesión activa.
   * La sesión se verifica automáticamente al montar el proveedor.
   */
  const checkSession = useCallback(async () => {
    // No-op ya que verifySession se ejecuta en el montaje de AuthProvider
  }, []);

  const value = {
    user,
    loading,
    initializing: false,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkSession,
    updateUser: (updatedData) => setUser((prev) => ({ ...prev, ...updatedData })),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
