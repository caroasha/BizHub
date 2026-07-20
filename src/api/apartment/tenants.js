import api from '../axios';
export const getTenants = (params) => api.get('/apartment/tenants', { params });
export const getTenant = (id) => api.get(`/apartment/tenants/${id}`);
export const createTenant = (data) => api.post('/apartment/tenants', data);
export const updateTenant = (id, data) => api.put(`/apartment/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/apartment/tenants/${id}`);