import api from '../axios';

const BASE = '/resto/settings';

export const getSettings = () => api.get(BASE);
export const updateGeneralSettings = (data) => api.put(`${BASE}/general`, data);
export const updateProfile = (data) => api.put(`${BASE}/profile`, data);
export const updatePassword = (data) => api.put(`${BASE}/password`, data);
export const updatePreferences = (data) => api.put(`${BASE}/preferences`, data);
export const updateNotifications = (data) => api.put(`${BASE}/notifications`, data);
export const updateOpeningHours = (data) => api.put(`${BASE}/opening-hours`, data);
export const resetSettings = () => api.post(`${BASE}/reset`);