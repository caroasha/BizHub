import api from '../axios';
export const getDashboard = () => api.get('/apartment/reports/dashboard');