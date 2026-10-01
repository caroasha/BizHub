import api from '../axios';
export const getStaff = () => api.get('/apartment/staff');
export const createStaff = (data) => api.post('/apartment/staff', data);
export const updateStaff = (id, data) => api.put(`/apartment/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/apartment/staff/${id}`);