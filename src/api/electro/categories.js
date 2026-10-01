import api from '../axios';
export const getCategories = () => api.get('/electro/categories');
export const createCategory = (data) => api.post('/electro/categories', data);
export const updateCategory = (id, data) => api.put(`/electro/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/electro/categories/${id}`);