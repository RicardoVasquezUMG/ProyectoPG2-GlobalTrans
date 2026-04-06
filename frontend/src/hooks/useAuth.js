/**
 * Hook para acceder al contexto de autenticación.
 * Provee: user, token, loading, isAuthenticated, login, register, logout.
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
