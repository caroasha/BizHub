import api from '../axios';
export const getPackages = () => api.get('/cyber/packages');
export const createPackage = (data) => api.post('/cyber/packages', data);
export const updatePackage = (id, data) => api.put(`/cyber/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/cyber/packages/${id}`);