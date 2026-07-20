import api from '../axios';

const BASE = '/resto/staff';

export const getStaff = (params) => api.get(BASE, { params });
export const getStaffMember = (id) => api.get(`${BASE}/${id}`);
export const getStaffStats = () => api.get(`${BASE}/stats`);
export const createStaff = (data) => api.post(BASE, data);
export const updateStaff = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteStaff = (id) => api.delete(`${BASE}/${id}`);
export const changeStaffPassword = (id, data) => api.patch(`${BASE}/${id}/password`, data);
export const toggleStaffStatus = (id) => api.patch(`${BASE}/${id}/toggle`);