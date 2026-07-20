import api from '../axios';

const BASE = '/resto/stock';

export const getStockItems = (params) => api.get(BASE, { params });
export const getStockItem = (id) => api.get(`${BASE}/${id}`);
export const getLowStockItems = () => api.get(`${BASE}/low-stock`);
export const getExpiringItems = () => api.get(`${BASE}/expiring`);
export const getStockStats = () => api.get(`${BASE}/stats`);
export const createStockItem = (data) => api.post(BASE, data);
export const updateStockItem = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteStockItem = (id) => api.delete(`${BASE}/${id}`);
export const recordStockUsage = (id, data) => api.patch(`${BASE}/${id}/use`, data);
export const addStock = (id, data) => api.patch(`${BASE}/${id}/add`, data);