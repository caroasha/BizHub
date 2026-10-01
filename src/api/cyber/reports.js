import api from '../axios';
export const getDashboard = () => api.get('/cyber/reports/dashboard');