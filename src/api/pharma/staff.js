import api from '../axios';

export const getStaff = () => api.get('/pharma/staff');
export const createStaff = (data) => api.post('/pharma/staff', data);
export const updateStaff = (id, data) => api.put(`/pharma/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/pharma/staff/${id}`);