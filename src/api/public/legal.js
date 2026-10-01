import api from '../axios';

export const getLegalDocs = () => api.get('/public/legal');
export const getLegalDoc = (type) => api.get(`/public/legal/${type}`);