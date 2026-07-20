import api from '../axios';
export const getSettings = () => api.get('/apartment/settings');
export const updateGeneral = (data) => api.put('/apartment/settings/general', data);
export const updateProfile = (data) => api.put('/apartment/settings/profile', data);
export const updatePassword = (data) => api.put('/apartment/settings/password', data);
export const updatePreferences = (data) => api.put('/apartment/settings/preferences', data);