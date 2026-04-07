import axiosInstance from './axiosInstance';

/**
 * Actualiza el perfil de un usuario existente en la base de datos.
 * @param {string} userId - El ID del usuario.
 * @param {object} data - Datos a actualizar (full_name, phone, avatar_url).
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (userId, data) => {
  const response = await axiosInstance.put(`/api/users/${userId}`, data);
  return response.data;
};
