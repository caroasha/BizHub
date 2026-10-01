import api from '../axios';

const BASE = '/resto/expenses';

export const getExpenses = (params) => api.get(BASE, { params });
export const getExpense = (id) => api.get(`${BASE}/${id}`);
export const getExpenseStats = () => api.get(`${BASE}/stats`);
export const createExpense = (data) => api.post(BASE, data);
export const deleteExpense = (id) => api.delete(`${BASE}/${id}`);