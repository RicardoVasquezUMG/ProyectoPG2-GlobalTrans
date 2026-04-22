import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de todas las campañas.
 * @returns {Promise<Array>} Lista de campañas.
 */
export const getCampanias = async () => {
  const response = await axiosInstance.get('/api/campanias');
  return response.data;
};

/**
 * Crea una nueva campaña.
 * @param {Object} data - Datos de la campaña.
 * @returns {Promise<Object>} La campaña creada.
 */
export const createCampania = async (data) => {
  const response = await axiosInstance.post('/api/campanias', data);
  return response.data;
};

/**
 * Actualiza una campaña existente.
 * @param {string} campaniaId - El ID de la campaña.
 * @param {Object} data - Datos a actualizar.
 * @returns {Promise<Object>} La campaña actualizada.
 */
export const updateCampania = async (campaniaId, data) => {
  const response = await axiosInstance.put(`/api/campanias/${campaniaId}`, data);
  return response.data;
};

/**
 * Elimina una campaña.
 * @param {string} campaniaId - El ID de la campaña.
 * @returns {Promise<void>}
 */
export const deleteCampania = async (campaniaId) => {
  const response = await axiosInstance.delete(`/api/campanias/${campaniaId}`);
  return response.data;
};
