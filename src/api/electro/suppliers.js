import api from '../axios';
export const getSuppliers = () => api.get('/electro/suppliers');
export const getSupplier = (id) => api.get(`/electro/suppliers/${id}`);
export const createSupplier = (data) => api.post('/electro/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/electro/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/electro/suppliers/${id}`);