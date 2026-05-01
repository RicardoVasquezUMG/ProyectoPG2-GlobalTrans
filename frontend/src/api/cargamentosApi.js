import axiosInstance from './axiosInstance';

/**
 * Obtiene la lista de todos los cargamentos.
 * @returns {Promise<Array>}
 */
export const getCargamentos = async () => {
  const response = await axiosInstance.get('/api/cargamentos');
  return response.data;
};

/**
 * Crea un nuevo cargamento en la base de datos.
 * @param {object} data - Datos del cargamento (furgon_id, campania_id).
 * @returns {Promise<object>}
 */
export const createCargamento = async (data) => {
  const response = await axiosInstance.post('/api/cargamentos', data);
  return response.data;
};

/**
 * Actualiza el estado de un cargamento existente.
 * @param {string} cargamentoId - El ID del cargamento.
 * @param {object} data - Datos a actualizar (solo estado).
 * @returns {Promise<object>}
 */
export const updateCargamento = async (cargamentoId, data) => {
  const response = await axiosInstance.patch(`/api/cargamentos/${cargamentoId}`, data);
  return response.data;
};

/**
 * Elimina un cargamento.
 * @param {string} cargamentoId - El ID del cargamento.
 * @returns {Promise<object>}
 */
export const deleteCargamento = async (cargamentoId) => {
  const response = await axiosInstance.delete(`/api/cargamentos/${cargamentoId}`);
  return response.data;
};

/**
 * Obtiene los documentos asociados a un cargamento.
 * @param {string} cargamentoId - El ID del cargamento.
 * @returns {Promise<Array>}
 */
export const getDocumentosCargamento = async (cargamentoId) => {
  const response = await axiosInstance.get(`/api/cargamentos/${cargamentoId}/documentos`);
  return response.data;
};

/**
 * Sube un documento asociado a un cargamento.
 * @param {string} cargamentoId - El ID del cargamento.
 * @param {File} file - El archivo a subir.
 * @param {string} tipo - El tipo de documento (Factura, Guía, etc).
 * @returns {Promise<object>}
 */
export const uploadDocumentoCargamento = async (cargamentoId, file, tipo) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);

  const response = await axiosInstance.post(`/api/cargamentos/${cargamentoId}/documentos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Elimina un documento asociado a un cargamento.
 * @param {string} documentoId - El ID del documento a eliminar.
 * @returns {Promise<object>}
 */
export const deleteDocumentoCargamento = async (documentoId) => {
  const response = await axiosInstance.delete(`/api/cargamentos/documentos/${documentoId}`);
  return response.data;
};
