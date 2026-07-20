import api from '../axios';

const BASE = '/resto/reports';

export const getSalesReport = (params) => api.get(`${BASE}/sales`, { params });
export const getExpenseReport = (params) => api.get(`${BASE}/expenses`, { params });
export const getInventoryReport = () => api.get(`${BASE}/inventory`);
export const getPayrollReport = (params) => api.get(`${BASE}/payroll`, { params });
export const getGeneralReport = (params) => api.get(`${BASE}/general`, { params });