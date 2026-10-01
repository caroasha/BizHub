import api from '../axios';

export const registerTenant = (data) => api.post('/public/registration', data);
export const checkAvailability = (params) => api.get('/public/registration/check', { params });