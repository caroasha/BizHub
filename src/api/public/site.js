import api from '../axios';

export const getSiteSettings = () => api.get('/public/site');
export const getModules = () => api.get('/public/site/modules');
export const getFAQs = () => api.get('/public/site/faqs');
export const getTestimonials = () => api.get('/public/site/testimonials');
export const getAiSettings = () => api.get('/public/ai-settings');
export const getPaymentMethods = () => api.get('/public/payment-methods');