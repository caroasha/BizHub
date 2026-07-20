import api from '../axios';

export const getDashboard = () => api.get('/pharma/reports/dashboard');
export const getSalesReport = (params) => api.get('/pharma/reports/sales', { params });
export const getExpiryReport = () => api.get('/pharma/reports/expiry');
export const getInventoryReport = () => api.get('/pharma/reports/inventory');
export const getPLReport = (params) => api.get('/pharma/reports/profit-loss', { params });