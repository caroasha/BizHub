import api from '../axios';
export const getSales = (params) => api.get('/cyber/sales', { params });
export const createSale = (data) => api.post('/cyber/sales', data);
export const createInvoice = (data) => api.post('/cyber/sales/invoice', data);
export const updateInvoice = (id, data) => api.put(`/cyber/sales/${id}`, data);
export const markInvoicePaid = (id) => api.put(`/cyber/sales/${id}/pay`);
export const cancelSale = (id) => api.put(`/cyber/sales/${id}/cancel`);
export const sendInvoiceEmail = (id, email) => api.post(`/cyber/sales/${id}/email`, { email });