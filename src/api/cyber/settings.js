import api from '../axios';
export const getSettings = () => api.get('/cyber/settings');
export const updateGeneral = (data) => api.put('/cyber/settings/general', data);
export const updateProfile = (data) => api.put('/cyber/settings/profile', data);
export const updatePassword = (data) => api.put('/cyber/settings/password', data);
export const updatePreferences = (data) => api.put('/cyber/settings/preferences', data);