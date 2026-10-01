import api from '../axios';

const BASE = '/resto/menu';

export const getMenuItems = (params) => api.get(BASE, { params });
export const getMenuItem = (id) => api.get(`${BASE}/${id}`);
export const getAvailableMenu = () => api.get(`${BASE}/available`);
export const getMenuCategories = () => api.get(`${BASE}/categories`);
export const getMenuStats = () => api.get(`${BASE}/stats`);
export const createMenuItem = (data) => api.post(BASE, data);
export const updateMenuItem = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`${BASE}/${id}`);
export const toggleMenuItem = (id) => api.patch(`${BASE}/${id}/toggle`);