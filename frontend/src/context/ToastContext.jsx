/**
 * Contexto de notificaciones Toast.
 * Provee funciones globales para mostrar notificaciones usando PrimeReact Toast.
 */
import { createContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toastRef = useRef(null);

  /**
   * Muestra una notificación de éxito.
   * @param {string} detail - Mensaje a mostrar
   * @param {string} [summary='Éxito'] - Título de la notificación
   */
  const showSuccess = (detail, summary = 'Éxito') => {
    toastRef.current?.show({
      severity: 'success',
      summary,
      detail,
      life: 4000,
    });
  };

  /**
   * Muestra una notificación de error.
   * @param {string} detail - Mensaje a mostrar
   * @param {string} [summary='Error'] - Título de la notificación
   */
  const showError = (detail, summary = 'Error') => {
    toastRef.current?.show({
      severity: 'error',
      summary,
      detail,
      life: 5000,
    });
  };

  /**
   * Muestra una notificación informativa.
   * @param {string} detail - Mensaje a mostrar
   * @param {string} [summary='Información'] - Título de la notificación
   */
  const showInfo = (detail, summary = 'Información') => {
    toastRef.current?.show({
      severity: 'info',
      summary,
      detail,
      life: 4000,
    });
  };

  /**
   * Muestra una notificación de advertencia.
   * @param {string} detail - Mensaje a mostrar
   * @param {string} [summary='Atención'] - Título de la notificación
   */
  const showWarn = (detail, summary = 'Atención') => {
    toastRef.current?.show({
      severity: 'warn',
      summary,
      detail,
      life: 4500,
    });
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarn,
  };

  return (
    <ToastContext.Provider value={value}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}
