import api from '../axios';

export const getMedicines = (params) => api.get('/pharma/medicines', { params });
export const getMedicine = (id) => api.get(`/pharma/medicines/${id}`);
export const createMedicine = (data) => api.post('/pharma/medicines', data);
export const updateMedicine = (id, data) => api.put(`/pharma/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/pharma/medicines/${id}`);
export const adjustStock = (id, data) => api.put(`/pharma/medicines/${id}/stock`, data);