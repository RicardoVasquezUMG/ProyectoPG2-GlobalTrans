/**
 * Funciones de utilidad para formateo de datos.
 */

/**
 * Formatea una fecha ISO o un objeto Date a un formato legible (ej. "15/8/2023 14:30")
 * @param {string|Date} dateString 
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
