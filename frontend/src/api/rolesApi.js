import axiosInstance from './axiosInstance';

/**
 * Obtiene todos los roles disponibles en el sistema.
 * @returns {Promise<Array>}
 */
export const getRoles = async () => {
  const response = await axiosInstance.get('/api/roles');
  return response.data;
};
