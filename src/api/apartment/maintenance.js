import api from '../axios';
export const getRequests = (params) => api.get('/apartment/maintenance', { params });
export const createRequest = (data) => api.post('/apartment/maintenance', data);
export const updateRequest = (id, data) => api.put(`/apartment/maintenance/${id}`, data);