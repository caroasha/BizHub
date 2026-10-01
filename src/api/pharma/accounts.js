import api from '../axios';

export const getAccounts = (params) => api.get('/pharma/accounts', { params });
export const getAccountSummary = (params) => api.get('/pharma/accounts/summary', { params });
export const createAccount = (data) => api.post('/pharma/accounts', data);
export const updateAccount = (id, data) => api.put(`/pharma/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/pharma/accounts/${id}`);