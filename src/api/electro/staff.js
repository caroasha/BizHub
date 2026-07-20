import api from '../axios';
export const getStaff = () => api.get('/electro/staff');
export const createStaff = (data) => api.post('/electro/staff', data);
export const updateStaff = (id, data) => api.put(`/electro/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/electro/staff/${id}`);