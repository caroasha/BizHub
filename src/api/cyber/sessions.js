import api from '../axios';
export const getSessions = (params) => api.get('/cyber/sessions', { params });
export const startSession = (data) => api.post('/cyber/sessions/start', data);
export const endSession = (id) => api.put(`/cyber/sessions/${id}/end`);