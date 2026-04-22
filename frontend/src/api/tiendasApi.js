import axiosInstance from './axiosInstance';

export const getTiendas = async () => {
  const response = await axiosInstance.get('/api/tiendas/');
  return response.data;
};

export const getTienda = async (id) => {
  const response = await axiosInstance.get(`/api/tiendas/${id}`);
  return response.data;
};

export const createTienda = async (data) => {
  const response = await axiosInstance.post('/api/tiendas/', data);
  return response.data;
};

export const updateTienda = async (id, data) => {
  const response = await axiosInstance.put(`/api/tiendas/${id}`, data);
  return response.data;
};

export const deleteTienda = async (id) => {
  const response = await axiosInstance.delete(`/api/tiendas/${id}`);
  return response.data;
};
