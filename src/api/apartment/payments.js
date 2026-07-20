import api from '../axios';
export const getPayments = (params) => api.get('/apartment/payments', { params });
export const createPayment = (data) => api.post('/apartment/payments', data);