import api from '../axios';

export const sendAiMessage = (message) => api.post('/pharma/ai/chat', { message });