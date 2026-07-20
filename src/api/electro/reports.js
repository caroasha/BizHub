import api from '../axios';
export const getDashboard = () => api.get('/electro/reports/dashboard');