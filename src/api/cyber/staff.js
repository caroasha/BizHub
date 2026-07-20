import api from '../axios';
export const getStaff = () => api.get('/cyber/staff');
export const createStaff = (data) => api.post('/cyber/staff', data);
export const updateStaff = (id, data) => api.put(`/cyber/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/cyber/staff/${id}`);