import api from '../axios';
export const getComputers = () => api.get('/cyber/computers');
export const createComputer = (data) => api.post('/cyber/computers', data);
export const updateComputer = (id, data) => api.put(`/cyber/computers/${id}`, data);
export const deleteComputer = (id) => api.delete(`/cyber/computers/${id}`);