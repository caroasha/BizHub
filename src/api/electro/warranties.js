import api from '../axios';
export const getWarranties = (params) => api.get('/electro/warranties', { params });
export const createWarranty = (data) => api.post('/electro/warranties', data);
export const updateWarranty = (id, data) => api.put(`/electro/warranties/${id}`, data);