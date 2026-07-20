import api from '../axios';

export const getPlans = () => api.get('/public/plans');
export const getPlanBySlug = (slug) => api.get(`/public/plans/${slug}`);