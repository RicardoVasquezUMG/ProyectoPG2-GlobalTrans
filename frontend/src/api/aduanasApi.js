import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de aduanas.
 * @param {boolean} activeOnly - Filtra solo aduanas activas.
 * @returns {Promise<Array>} Lista de aduanas.
 */
export const getAduanas = async (activeOnly = true) => {
  const response = await axiosInstance.get(`/api/aduanas?active_only=${activeOnly}`);
  return response.data;
};

/**
 * Crea una nueva aduana.
 * @param {Object} data - Datos de la aduana.
 * @returns {Promise<Object>} Aduana creada.
 */
export const crearAduana = async (data) => {
  const response = await axiosInstance.post('/api/aduanas', data);
  return response.data;
};

/**
 * Actualiza una aduana existente.
 * @param {string} id - ID de la aduana a actualizar.
 * @param {Object} data - Nuevos datos de la aduana.
 * @returns {Promise<Object>} Aduana actualizada.
 */
export const actualizarAduana = async (id, data) => {
  const response = await axiosInstance.put(`/api/aduanas/${id}`, data);
  return response.data;
};

/**
 * Elimina una aduana.
 * @param {string} id - ID de la aduana a eliminar.
 * @returns {Promise<void>} Resolución cuando se elimina.
 */
export const eliminarAduana = async (id) => {
  await axiosInstance.delete(`/api/aduanas/${id}`);
};
