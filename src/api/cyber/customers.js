import api from '../axios';
export const getCustomers = (params) => api.get('/cyber/customers', { params });
export const createCustomer = (data) => api.post('/cyber/customers', data);
export const updateCustomer = (id, data) => api.put(`/cyber/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/cyber/customers/${id}`);