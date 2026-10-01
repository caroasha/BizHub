import api from '../axios';
export const getLeases = (params) => api.get('/apartment/leases', { params });
export const getLease = (id) => api.get(`/apartment/leases/${id}`);
export const createLease = (data) => api.post('/apartment/leases', data);
export const updateLease = (id, data) => api.put(`/apartment/leases/${id}`, data);
export const terminateLease = (id) => api.put(`/apartment/leases/${id}/terminate`);