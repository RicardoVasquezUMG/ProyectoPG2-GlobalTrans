/**
 * Hook para acceder al contexto de notificaciones Toast.
 * Provee: showSuccess, showError, showInfo, showWarn.
 */
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
}
