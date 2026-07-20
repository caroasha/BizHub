import api from '../axios';

const BASE = '/resto/payroll';

export const getPayrolls = (params) => api.get(BASE, { params });
export const getPayroll = (id) => api.get(`${BASE}/${id}`);
export const getPayrollByEmployee = (employeeId) => api.get(`${BASE}/employee/${employeeId}`);
export const getPayrollByPeriod = (period) => api.get(`${BASE}/period/${period}`);
export const getPayrollStats = () => api.get(`${BASE}/stats`);
export const createPayroll = (data) => api.post(BASE, data);
export const processAllPayrolls = (data) => api.post(`${BASE}/process-all`, data);
export const payAllSalaries = () => api.post(`${BASE}/pay-all`);
export const paySalary = (id) => api.patch(`${BASE}/${id}/pay`);
export const deletePayroll = (id) => api.delete(`${BASE}/${id}`);