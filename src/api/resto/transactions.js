import api from '../axios';

const BASE = '/resto/transactions';

export const getTransactions = (params) => api.get(BASE, { params });
export const getTransaction = (id) => api.get(`${BASE}/${id}`);
export const getTransactionStats = () => api.get(`${BASE}/stats`);
export const createTransaction = (data) => api.post(BASE, data);
export const printReceipt = (id) => api.get(`${BASE}/${id}/receipt`);