import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de todos los vehículos.
 * @returns {Promise<Array>}
 */
export const getVehicles = async () => {
  const response = await axiosInstance.get('/api/vehicles');
  return response.data;
};

/**
 * Crea un nuevo vehículo en la base de datos.
 * @param {object} data - Datos del vehículo (tipo, tonelaje, placas, estado).
 * @returns {Promise<object>}
 */
export const createVehicle = async (data) => {
  const response = await axiosInstance.post('/api/vehicles', data);
  return response.data;
};

/**
 * Actualiza los datos de un vehículo existente.
 * @param {string} vehicleId - El ID del vehículo.
 * @param {object} data - Datos a actualizar.
 * @returns {Promise<object>}
 */
export const updateVehicle = async (vehicleId, data) => {
  const response = await axiosInstance.put(`/api/vehicles/${vehicleId}`, data);
  return response.data;
};

/**
 * Elimina un vehículo.
 * @param {string} vehicleId - El ID del vehículo.
 * @returns {Promise<object>}
 */
export const deleteVehicle = async (vehicleId) => {
  const response = await axiosInstance.delete(`/api/vehicles/${vehicleId}`);
  return response.data;
};
