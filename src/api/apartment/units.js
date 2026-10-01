import api from '../axios';
export const getUnits = (params) => api.get('/apartment/units', { params });
export const getUnit = (id) => api.get(`/apartment/units/${id}`);
export const createUnit = (data) => api.post('/apartment/units', data);
export const updateUnit = (id, data) => api.put(`/apartment/units/${id}`, data);
export const deleteUnit = (id) => api.delete(`/apartment/units/${id}`);