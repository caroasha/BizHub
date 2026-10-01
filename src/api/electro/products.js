import api from '../axios';
export const getProducts = (params) => api.get('/electro/products', { params });
export const getProduct = (id) => api.get(`/electro/products/${id}`);
export const createProduct = (data) => api.post('/electro/products', data);
export const updateProduct = (id, data) => api.put(`/electro/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/electro/products/${id}`);
export const adjustStock = (id, data) => api.put(`/electro/products/${id}/stock`, data);