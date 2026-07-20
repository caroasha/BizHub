import api from '../axios';

export const getCategories = () => api.get('/pharma/categories');
export const createCategory = (data) => api.post('/pharma/categories', data);
export const updateCategory = (id, data) => api.put(`/pharma/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/pharma/categories/${id}`);