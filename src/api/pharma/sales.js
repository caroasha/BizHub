import api from '../axios';

export const getSales = (params) => api.get('/pharma/sales', { params });
export const getSale = (id) => api.get(`/pharma/sales/${id}`);
export const createSale = (data) => api.post('/pharma/sales', data);
export const createInvoice = (data) => api.post('/pharma/sales/invoice', data);
export const updateInvoice = (id, data) => api.put(`/pharma/sales/${id}`, data);
export const markInvoicePaid = (id) => api.put(`/pharma/sales/${id}/pay`);
export const cancelSale = (id) => api.put(`/pharma/sales/${id}/cancel`);
export const sendInvoiceEmail = (id, email) => api.post(`/pharma/sales/${id}/email`, { email });
export const getSaleStats = () => api.get('/pharma/sales/stats');