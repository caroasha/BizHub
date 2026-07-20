import api from '../axios';

const BASE = '/resto/dashboard';

export const getDashboardStats = () => api.get(`${BASE}/stats`);