import api from '../axios';

const BASE = '/resto/customers';

export const getCustomers = (params) => api.get(BASE, { params });
export const getCustomer = (id) => api.get(`${BASE}/${id}`);
export const getCustomerByPhone = (phone) => api.get(`${BASE}/phone/${phone}`);
export const getCustomerStats = () => api.get(`${BASE}/stats`);
export const createCustomer = (data) => api.post(BASE, data);
export const updateCustomer = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteCustomer = (id) => api.delete(`${BASE}/${id}`);