import api from '../axios';
export const getServices = () => api.get('/cyber/services');
export const createService = (data) => api.post('/cyber/services', data);
export const updateService = (id, data) => api.put(`/cyber/services/${id}`, data);
export const deleteService = (id) => api.delete(`/cyber/services/${id}`);