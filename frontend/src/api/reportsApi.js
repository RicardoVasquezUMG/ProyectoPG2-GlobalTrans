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

export const getPrediccionAduanas = async (mes = null) => {
  const url = mes ? `/api/reports/prediccion-aduanas?mes=${mes}` : '/api/reports/prediccion-aduanas';
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getDashboardFinanciero = async () => {
  const response = await axiosInstance.get('/api/reports/dashboard-financiero');
  return response.data;
};

