import api from '../axios';

const BASE = '/resto/employees';

export const getEmployees = (params) => api.get(BASE, { params });
export const getEmployee = (id) => api.get(`${BASE}/${id}`);
export const getEmployeeStats = () => api.get(`${BASE}/stats`);
export const createEmployee = (data) => api.post(BASE, data);
export const updateEmployee = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteEmployee = (id) => api.delete(`${BASE}/${id}`);
export const updateEmployeeStatus = (id, status) => api.patch(`${BASE}/${id}/status`, { status });