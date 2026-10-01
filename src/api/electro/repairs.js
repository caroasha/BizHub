import api from '../axios';
export const getRepairs = (params) => api.get('/electro/repairs', { params });
export const createRepair = (data) => api.post('/electro/repairs', data);
export const updateRepair = (id, data) => api.put(`/electro/repairs/${id}`, data);