import axiosInstance from './axiosInstance';

export const getDashboardKpis = async () => {
  const response = await axiosInstance.get('/api/reports/dashboard-kpis');
  return response.data;
};

export const getAuditoria = async () => {
  const response = await axiosInstance.get('/api/reports/auditoria');
  return response.data;
};

export const getInteligenciaRutas = async () => {
  const response = await axiosInstance.get('/api/reports/inteligencia-rutas');
  return response.data;
};
