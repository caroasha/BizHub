import api from '../axios';
export const getProperties = () => api.get('/apartment/properties');
export const getProperty = (id) => api.get(`/apartment/properties/${id}`);
export const createProperty = (data) => api.post('/apartment/properties', data);
export const updateProperty = (id, data) => api.put(`/apartment/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/apartment/properties/${id}`);