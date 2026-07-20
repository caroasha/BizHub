import api from '../axios';

export const getSettings = () => api.get('/pharma/settings');
export const updateGeneral = (data) => api.put('/pharma/settings/general', data);
export const updateProfile = (data) => api.put('/pharma/settings/profile', data);
export const updatePassword = (data) => api.put('/pharma/settings/password', data);
export const updatePreferences = (data) => api.put('/pharma/settings/preferences', data);