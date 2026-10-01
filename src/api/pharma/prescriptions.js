import api from '../axios';

export const getPrescriptions = (params) => api.get('/pharma/prescriptions', { params });
export const getPrescription = (id) => api.get(`/pharma/prescriptions/${id}`);
export const createPrescription = (data) => api.post('/pharma/prescriptions', data);
export const updatePrescription = (id, data) => api.put(`/pharma/prescriptions/${id}`, data);
export const updatePrescriptionStatus = (id, status) => api.put(`/pharma/prescriptions/${id}/status`, { status });