import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de todos los usuarios.
 * @returns {Promise<Array>}
 */
export const getUsers = async () => {
  const response = await axiosInstance.get('/api/users');
  return response.data;
};

/**
 * Actualiza el perfil de un usuario existente en la base de datos.
 * @param {string} userId - El ID del usuario.
 * @param {object} data - Datos a actualizar (full_name, phone, avatar_url, role_id, is_active).
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (userId, data) => {
  const response = await axiosInstance.put(`/api/users/${userId}`, data);
  return response.data;
};

/**
 * Realiza un borrado lógico del usuario.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object>}
 */
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/api/users/${userId}`);
  return response.data;
};
