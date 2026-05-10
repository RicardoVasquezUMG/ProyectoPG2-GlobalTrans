import axiosInstance from './axiosInstance';

/**
 * Registra un checkpoint/evento en un viaje.
 */
export const registrarCheckpoint = async (viajeId, data) => {
  const response = await axiosInstance.post(`/api/tracking/${viajeId}/checkpoint`, data);
  return response.data;
};

/**
 * Actualiza la posición GPS actual de un viaje.
 */
export const actualizarPosicion = async (viajeId, data) => {
  const response = await axiosInstance.post(`/api/tracking/${viajeId}/posicion`, data);
  return response.data;
};

/**
 * Obtiene el historial de checkpoints de un viaje.
 */
export const obtenerHistorial = async (viajeId) => {
  const response = await axiosInstance.get(`/api/tracking/${viajeId}/historial`);
  return response.data;
};

/**
 * Obtiene la posición GPS actual de un viaje.
 */
export const obtenerPosicion = async (viajeId) => {
  const response = await axiosInstance.get(`/api/tracking/${viajeId}/posicion`);
  return response.data;
};

/**
 * Obtiene todos los viajes activos con posición para el mapa.
 */
export const obtenerViajesActivos = async () => {
  const response = await axiosInstance.get('/api/tracking/activos');
  return response.data;
};

/**
 * Obtiene los datos completos de un viaje para la vista de detalle.
 */
export const obtenerViajeDetalle = async (viajeId) => {
  const response = await axiosInstance.get(`/api/tracking/detalle/${viajeId}`);
  return response.data;
};
