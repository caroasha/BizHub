import api from '../axios';

export const getLandingContent = () => api.get('/public/landing');
export const submitContact = (data) => api.post('/public/landing/contact', data);
export const requestDemo = (data) => api.post('/public/landing/demo', data);
export const sendAiMessage = (message) => api.post('/public/landing/ai-chat', { message });
export const getAiSettings = () => api.get('/public/ai-settings');