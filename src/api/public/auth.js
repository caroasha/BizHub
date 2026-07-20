import api from '../axios';

export const loginUser = (email, password) => api.post('/public/auth/login', { email, password });
export const refreshUserToken = (refreshToken) => api.post('/public/auth/refresh', { refreshToken });
export const forgotPassword = (email) => api.post('/public/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/public/auth/reset-password', { token, newPassword });