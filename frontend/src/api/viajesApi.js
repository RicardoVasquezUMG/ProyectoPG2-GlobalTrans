import axiosInstance from './axiosInstance';

/**
 * Obtiene todos los viajes.
 * @returns {Promise<Array>} Lista de viajes.
 */
export const getViajes = async () => {
  const response = await axiosInstance.get('/api/viajes');
  return response.data;
};

/**
 * Crea un nuevo viaje.
 * @param {object} data - Datos del viaje.
 * @returns {Promise<object>} El viaje creado.
 */
export const createViaje = async (data) => {
  const response = await axiosInstance.post('/api/viajes', data);
  return response.data;
};

/**
 * Actualiza un viaje existente.
 * @param {string} id - ID del viaje.
 * @param {object} data - Datos a actualizar.
 * @returns {Promise<object>} El viaje actualizado.
 */
export const updateViaje = async (id, data) => {
  const response = await axiosInstance.put(`/api/viajes/${id}`, data);
  return response.data;
};

/**
 * Elimina un viaje.
 * @param {string} id - ID del viaje a eliminar.
 * @returns {Promise<void>}
 */
export const deleteViaje = async (id) => {
  const response = await axiosInstance.delete(`/api/viajes/${id}`);
  return response.data;
};
