import api from '../axios';

const BASE = '/resto/suppliers';

export const getSuppliers = (params) => api.get(BASE, { params });
export const getSupplier = (id) => api.get(`${BASE}/${id}`);
export const getSupplierStats = () => api.get(`${BASE}/stats`);
export const createSupplier = (data) => api.post(BASE, data);
export const updateSupplier = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteSupplier = (id) => api.delete(`${BASE}/${id}`);
export const toggleSupplierStatus = (id) => api.patch(`${BASE}/${id}/toggle`);