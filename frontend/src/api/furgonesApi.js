import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de todos los furgones.
 * @returns {Promise<Array>}
 */
export const getFurgones = async () => {
  const response = await axiosInstance.get('/api/furgones');
  return response.data;
};

/**
 * Crea un nuevo furgón en la base de datos.
 * @param {object} data - Datos del furgón.
 * @returns {Promise<object>}
 */
export const createFurgon = async (data) => {
  const response = await axiosInstance.post('/api/furgones', data);
  return response.data;
};

/**
 * Actualiza los datos de un furgón existente.
 * @param {string} furgonId - El ID del furgón.
 * @param {object} data - Datos a actualizar.
 * @returns {Promise<object>}
 */
export const updateFurgon = async (furgonId, data) => {
  const response = await axiosInstance.put(`/api/furgones/${furgonId}`, data);
  return response.data;
};

/**
 * Elimina un furgón.
 * @param {string} furgonId - El ID del furgón.
 * @returns {Promise<object>}
 */
export const deleteFurgon = async (furgonId) => {
  const response = await axiosInstance.delete(`/api/furgones/${furgonId}`);
  return response.data;
};
