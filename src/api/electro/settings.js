import api from '../axios';
export const getSettings = () => api.get('/electro/settings');
export const updateGeneral = (data) => api.put('/electro/settings/general', data);
export const updateProfile = (data) => api.put('/electro/settings/profile', data);
export const updatePassword = (data) => api.put('/electro/settings/password', data);
export const updatePreferences = (data) => api.put('/electro/settings/preferences', data);