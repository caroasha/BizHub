import api from '../axios';

export const getPurchases = (params) => api.get('/pharma/purchases', { params });
export const getPurchase = (id) => api.get(`/pharma/purchases/${id}`);
export const createPurchase = (data) => api.post('/pharma/purchases', data);
export const updatePurchaseStatus = (id, status) => api.put(`/pharma/purchases/${id}/status`, { status });